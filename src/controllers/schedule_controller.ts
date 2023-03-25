import { DueDateEventScheduler, Event, PrismaClient, UnscheduledEventScheduler } from "@prisma/client";
import { RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import { build_controller } from "../lib/controller_builder";
import { generateICal, eventWithBase } from "../scheduler/calendar";

type conflicts = {
  a: any,
  b: Event
}
const getSchedule =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    // Get All schedulers
    var unscheduledEventSchedulers = await client.unscheduledEventScheduler.findMany({
      where: {
        userId: req.jwtBody!!.userId
      },
      include: {
        repeatInfo:true,
        base:true
      }
    })

    const scheduledEventSchedulers =
      await client.scheduledEventScheduler.findMany({
        where: {
          userId: req.jwtBody?.userId,
        },
        include: {
          repeatInfo:true,
          base:true
        }
      });
    const dueDateEventSchedulers = await client.dueDateEventScheduler.findMany({
      where: {
        userId: req.jwtBody?.userId,
      },
      include: {
        base:true
      }
    });

    // Mark All Future Planned Events as Deleted
    const deletedEvents = await client.event.findMany({
      where:{
        start: {gte: new Date()}
      },
      include: {
        scheduler:true
      }
    });
    const _ = await client.event.deleteMany({
      where: {
        start: {gte: new Date()}
      }
    });
    
    var conflicts:conflicts[] = [];
    var newEvents:eventWithBase[] = [];
    var schedulePointer = new Date();
    var endPoint = new Date(schedulePointer.valueOf());
    endPoint.setTime(endPoint.getTime() + 1000*60*60*24*parseInt(req.params.days));
    // Schedule Scheduled Events
    var eventQueue = [...scheduledEventSchedulers]
    while (eventQueue.length > 0 && schedulePointer <= endPoint) {
      const nextUp = eventQueue.pop();
      if (nextUp?.base?.doneScheduling || nextUp!!.startDateTime > endPoint) {
        continue;
      }

      console.log("I'm calling from fixed date");
      console.log(nextUp);
      const conflict:Event|null = await wouldConflict(client, nextUp!!.startDateTime, nextUp!!.endDateTime)
      if (conflict) {
        conflicts.push({a:nextUp, b:conflict})
      }
      const newEvent = await client.event.create({
        data: {
          start: nextUp!!.startDateTime,
          end: nextUp!!.endDateTime,
          userId: nextUp!!.userId,
          schedulerId: nextUp!!.id,
          kind: "FIXED_TIME",
          complete: false,
          deleted: false
        },
        include: {
          scheduler:true
        }
      });
      newEvents.push(newEvent);
      // Handle Repeat
      var doneScheduling = false;
      if  (nextUp!!.repeatInfo.days.split(',').filter(e=>e!=='').length < 1) {
          doneScheduling = true;
      }
      else if (nextUp!!.repeatInfo.repeatType === "WEEKLY") {
        nextUp!!.base.lastScheduled.setTime(nextUp!!.startDateTime.getTime());
        var repeatArr = nextUp!!.repeatInfo.days.split(',');
        repeatArr = repeatArr.filter(e=>e!=='');
        const oldIndex = repeatArr.indexOf(nextUp!!.base.lastScheduled.getDay().toString())
        const nextIndex = (oldIndex + 1) % repeatArr.length;
        let dayDiff = 0;
        console.log(repeatArr)
        if (nextIndex == 0) {
          dayDiff = 7 - parseInt(repeatArr[oldIndex]) + parseInt(repeatArr[nextIndex]);
        } else {
          dayDiff = parseInt(repeatArr[nextIndex]) - parseInt(repeatArr[oldIndex])
        }
        console.log("dayDiff:"+dayDiff)
        console.log(nextUp!!.startDateTime);
        nextUp!!.startDateTime.setTime(nextUp!!.startDateTime.getTime()+1000*60*60*24*dayDiff);
        console.log(nextUp!!.startDateTime);
        nextUp!!.endDateTime.setTime(nextUp!!.endDateTime.getTime()+1000*60*60*24*dayDiff);
        eventQueue.push(nextUp!!);
      }
      else if (nextUp!!.repeatInfo.repeatType === "MONTHLY") {
        nextUp!!.base.lastScheduled = nextUp!!.startDateTime;
        nextUp!!.startDateTime.setMonth(nextUp!!.startDateTime.getMonth()+1);
        nextUp!!.endDateTime.setMonth(nextUp!!.endDateTime.getMonth()+1);
        eventQueue.push(nextUp!!);
      } else {
        // yearly repeat
        nextUp!!.base.lastScheduled = nextUp!!.startDateTime;
        nextUp!!.startDateTime.setFullYear(nextUp!!.startDateTime.getFullYear()+1);
        nextUp!!.endDateTime.setFullYear(nextUp!!.endDateTime.getFullYear()+1);
        eventQueue.push(nextUp!!);
      }
      // cleanup or add
      if (doneScheduling || nextUp!!.startDateTime > endPoint) {
        client.scheduledEventScheduler.update({
          where: {
            id: nextUp!!.id
          },
          data: {
            startDateTime: nextUp!!.startDateTime,
            endDateTime: nextUp!!.endDateTime,
            
          }
        })
        client.eventSchedulerBase.update({
          where: {
            id: nextUp!!.baseId
          },
          data: {
            lastScheduled:nextUp!!.base.lastScheduled,
            doneScheduling
          }
        })
      } 
    }
    // Schedule Due Dates
    var mySchedulePointer = new Date(schedulePointer.valueOf());
    dueDateEventSchedulers.sort((a:DueDateEventScheduler, b:DueDateEventScheduler)=> {return a.dueDateTime < b.dueDateTime ? -1:1})
    while(dueDateEventSchedulers.length > 0 && mySchedulePointer < endPoint) {
      var currentEvent = dueDateEventSchedulers.pop();
      if (currentEvent!!.base.doneScheduling) {
        continue;
      }
      if (currentEvent?.base.lastScheduled == mySchedulePointer && dueDateEventSchedulers.length > 0) {
        var nextEvent = dueDateEventSchedulers.pop()
        dueDateEventSchedulers.push(currentEvent);
        currentEvent = nextEvent;
      }
      var instanceEndTime=new Date(mySchedulePointer.valueOf())
      instanceEndTime.setMinutes(instanceEndTime.getMinutes() + currentEvent!!.blockSize);
      console.log("I'm calling from due date")
      const conflict = await wouldConflict(client, mySchedulePointer, instanceEndTime)
      if (conflict && mySchedulePointer < conflict.start) {
        instanceEndTime = conflict.start;
      } else if(conflict) {
        mySchedulePointer.setTime(conflict!!.end.getTime())
        dueDateEventSchedulers.push(currentEvent!!);
        continue;
      }
      const event = await client.event.create({
        data:{
          start:mySchedulePointer,
          end: instanceEndTime,
          userId:currentEvent!!.userId,
          schedulerId:currentEvent!!.id,
          complete:false,
          deleted:false,
          kind:"DUE_DATE"
        },
        include: {
          scheduler: true,
        }
      });
      newEvents.push(event);
      var doneScheduling = false
      // Check to see if we finished scheduling
      currentEvent!.amountScheduled += (instanceEndTime.getTime() - schedulePointer.getTime())/(60000)
      if (currentEvent!.amountScheduled >= currentEvent!.base.duration) {
        doneScheduling = true
      }

      mySchedulePointer.setTime(instanceEndTime.getTime())
      currentEvent!.base.lastScheduled.setTime(mySchedulePointer.getTime());
      if (mySchedulePointer < endPoint || doneScheduling) {
        client.dueDateEventScheduler.update({
          where: {
            id: currentEvent!!.id
          },
          data: {
            amountScheduled: currentEvent!!.amountScheduled,            
          }
        })
        client.eventSchedulerBase.update({
          where: {
            id: currentEvent!!.baseId
          },
          data: {
            lastScheduled:currentEvent!!.base.lastScheduled,
            doneScheduling
          }
        })
      }
    }

    // Schedule Unscheduled
    var unscheduledSchedulePointer =  new Date(schedulePointer.valueOf());
    let tempEvents = []
    while(unscheduledEventSchedulers.length > 0 || tempEvents.length > 0) {
      let currentUnscheduledEvent = unscheduledEventSchedulers.pop();
      if (currentUnscheduledEvent!!.base?.doneScheduling) {
        continue;
      }

      let nextTimeToSchedule = new Date(currentEvent!!.base.lastScheduled.valueOf())
      if (currentUnscheduledEvent?.repeatInfo.repeatType == 'WEEKLY') {
        nextTimeToSchedule.setTime(nextTimeToSchedule.getTime() + 1000*60*60*24*(7 / currentUnscheduledEvent.repeatInfo.days.split(',').length))
      } else if (currentUnscheduledEvent?.repeatInfo.repeatType == 'MONTHLY') {
        nextTimeToSchedule.setTime(nextTimeToSchedule.getTime() + 1000*60*60*24*(30 / currentUnscheduledEvent.repeatInfo.days.split(',').length))
      } else if (currentUnscheduledEvent?.repeatInfo.repeatType == 'YEARLY') {
        nextTimeToSchedule.setTime(nextTimeToSchedule.getTime() + 1000*60*60*24*(365 / currentUnscheduledEvent.repeatInfo.days.split(',').length))
      }

      if (unscheduledSchedulePointer < nextTimeToSchedule) {
        if (unscheduledEventSchedulers.length > 0) {
          let nextEvent = unscheduledEventSchedulers.pop();
          unscheduledEventSchedulers.push(currentUnscheduledEvent!!);
          currentUnscheduledEvent = nextEvent;
        }

      }

      const endTime = new Date(unscheduledSchedulePointer.valueOf())
      endTime.setMinutes(endTime.getMinutes() + currentUnscheduledEvent!!.base!!.duration);
      console.log("I'm calling from unscheduled")
      const conflict : Event | null = await wouldConflict(client, unscheduledSchedulePointer, endTime)

      if (conflict) {
        unscheduledSchedulePointer.setTime(conflict!!.end.getTime())
        tempEvents.push(currentUnscheduledEvent!!);
        if (unscheduledEventSchedulers.length == 0) {
          unscheduledEventSchedulers = [...tempEvents];
          tempEvents = [];
          unscheduledSchedulePointer.setTime(conflict!!.end.getTime());
        }
        continue;
      } 

      const newEvent = await client.event.create({
        data: {
          start: unscheduledSchedulePointer,
          end: endTime,
          userId: currentUnscheduledEvent!!.userId,
          schedulerId: currentUnscheduledEvent!!.id,
          kind: "FLEXIBLE_TIME",
          complete: false,
          deleted: false
        },
        include: {
          scheduler:true
        }
      });

      newEvents.push(newEvent);

      unscheduledEventSchedulers = [...unscheduledEventSchedulers, ...tempEvents];
      currentUnscheduledEvent?.base.lastScheduled.setTime(unscheduledSchedulePointer.getTime());
      unscheduledSchedulePointer.setTime(newEvent.end.getTime());
    }


    res.set({
      "Content-Disposition": 'attachment; filename="newEvents.ics"',
      "Content-type": "text/calendar",
    });
    
    res.json({blob:generateICal(newEvents, deletedEvents)});
  };

const wouldConflict = async (client:PrismaClient, start:Date, end:Date):Promise<Event|null> => {
  console.log(start);
  console.log(end);
  const conflict = await client.event.findFirst({
    where : {
      OR: [
        {
          start: { gte: start, lt: end}
        },
        {
          end: {gt: start, lte:end}
        },
        {
          start: {gte: start},
          end: {lte: end}
        }
      ]
    }
  })
  return conflict
}


const getEvents =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    const nextWeek = new Date(today.valueOf());
    nextWeek.setTime(today.getTime() + 1000*60*60*24*7);
    const events = client.event.findMany({
      where: {
        userId: req.jwtBody!!.userId,
        start: { gte: today },
        end: { lte: nextWeek },
      },
      include: {
        scheduler: true,
      },
    });
    res.json({events});
  };

export const scheduleController = build_controller("schedules", [
  { path: "/:days", endpointBuilder: getSchedule, method: "get" },
  { path: "/events", endpointBuilder: getEvents, method: "get"}
]);

