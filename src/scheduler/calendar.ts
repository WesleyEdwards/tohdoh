import ical from "ical-generator";
import http from "http";
import { RequestHandler } from "express";
import { Event, EventSchedulerBase } from "@prisma/client";

// get events from User
// take two parameters, one list of events to be scheduled, list of evenets ot be deleted


export type eventWithBase = Event & {
    scheduler: EventSchedulerBase;
}

const isDeleted = (eventId: Number, deletedEvents: eventWithBase[]) => {
    return deletedEvents.some(e => e.id === eventId)
}

const getWeekOfEvents = (eventsWithBase: eventWithBase[], deletedEventsWithBase: eventWithBase[]) => {
    // get events from today
    let weekOfEvents: eventWithBase[] = [];
    eventsWithBase.forEach((event) => {
        let currentDateTime = new Date()
        // check if event is from the past
        if (event.start < currentDateTime) {
            // make sure event is not deleted
            if (!isDeleted(event.id, deletedEventsWithBase)) {
                weekOfEvents.push(event)
            }
        }
    });
    return weekOfEvents;
}

export const generateICal = (eventsWithBase: eventWithBase[], deletedEventsWithBase: eventWithBase[]) => {
    const today = new Date()
    const weekOfEvents = getWeekOfEvents(eventsWithBase, deletedEventsWithBase)
    const calendar = ical({name: today.toString() + '-calendar'})
    eventsWithBase.forEach((event) => {
        calendar.createEvent({
            id: event.id,
            start: event.start,
            end: event.end,
            summary: event.scheduler.name
        });
    });
    return calendar.toString();
}
