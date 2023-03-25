import { DueDateEventScheduler, Event, PrismaClient, UnscheduledEventScheduler } from "@prisma/client";
import { RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import { build_controller } from "../lib/controller_builder";
import { scheduledEventScheduler } from "../scheduler/scheduler";

type conflicts = {
  a: any,
  b: Event
}
const getSchedule =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    let scheduleICal: string = "";
    // Get All schedulers
    const unscheduledEventSchedulers = await client.unscheduledEventScheduler.findMany({
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
    const deletedEvents = await client.event.deleteMany({
      where: {
        start: {gte: new Date()}
      }
    });
    var conflicts:conflicts[] = [];
    var newEvents:Event[] = [];
    var schedulePointer = new Date();
    var endPoint = new Date(schedulePointer.valueOf());
    endPoint.setDate(endPoint.getDate() + parseInt(req.params.days));
    // Schedule Scheduled Events
    var eventQueue = [...scheduledEventSchedulers]
    while (eventQueue.length > 0 && schedulePointer <= endPoint) {
      const nextUp = eventQueue.pop();
      if (nextUp?.base?.doneScheduling || nextUp!!.startDateTime > endPoint) {
        continue;
      } 
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
      if  (nextUp!!.repeatInfo.days.split(',').length < 1) {
          doneScheduling = true;
      }
      else if (nextUp!!.repeatInfo.repeatType === "WEEKLY") {
        nextUp!!.base.lastScheduled = nextUp!!.startDateTime;
        const repeatArr = nextUp!!.repeatInfo.days.split(',')
        const oldIndex = repeatArr.indexOf(nextUp!!.base.lastScheduled.getDay().toString())
        const nextIndex = (oldIndex + 1) % repeatArr.length;
        let dayDiff = 0;
        if (nextIndex == 0) {
          dayDiff = 7 - parseInt(repeatArr[oldIndex]) + parseInt(repeatArr[nextIndex]);
        } else {
          dayDiff = parseInt(repeatArr[nextIndex]) - parseInt(repeatArr[oldIndex])
        }
        nextUp!!.startDateTime.setDate(nextUp!!.startDateTime.getDate()+dayDiff);
        nextUp!!.endDateTime.setDate(nextUp!!.endDateTime.getDate()+dayDiff);
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
    while(dueDateEventSchedulers.length > 0) {
      
    }

    // Schedule Unscheduled

    res.set({
      "Content-Disposition": 'attachment; filename="newEvents.ics"',
      "Content-type": "text/calendar",
    });
    res.send(scheduleICal);
  };

const wouldConflict = async (client:PrismaClient, start:Date, end:Date):Promise<Event|null> => {
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
    nextWeek.setDate(today.getDate() + 7);
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
    res.send(events);
  };

export const scheduleController = build_controller("schedules", [
  { path: "/:days", endpointBuilder: getSchedule, method: "get" },
  { path: "/events", endpointBuilder: getEvents, method: "get"}
]);

