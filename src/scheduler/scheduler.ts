// Here is a copyright header

function createEvent(eventScheduler: EventScheduler) {
    
}

export class EventScheduler {
    name!: String;
    id!: Number;
    latX!: Number;
    latY!: Number;
    travelTime!: Number;
    duration!: Number;
    doneScheduling!: Boolean
    priority!: Number
    lastScheduled!: Date
}

export class ScheduledEventScheduler {
    repeatInfo!: RepeatInfo;
    startDateTime!: Date
    endDateTime!: Date
}

export class DueDateEventScheduler {
    dueDateTime!: Date
    blockSize!: number
    amountScheduled!: Date
}

export class UnscheduledEventScheduler {
    repeatInfo!: RepeatInfo
}

export class User {
    email!: String;
    password!: String;
    id!: Number;
    scheduledEventScheduler!: ScheduledEventScheduler
    dueDateEventScheduler!: DueDateEventScheduler
    unscheduledEventScheduler!: UnscheduledEventScheduler
    events!: Event
    activeHours!: ActiveHours
    procrastinationIndex!: Number;
}

export class scheduledEventScheduler {
    repeatInfo!: RepeatInfo;
    startDateTime!: Date;
    endDateTime!: Date;
}

export enum RepeatType {
    DAY = 1,
    MONTH,
    YEAR
}

export class RepeatInfo {
    repeatType!: RepeatType;
    days!: Number[]
}

export class Event {
    id!: Number;
    start!: Date;
    end!: Date;
    user!: User
}

export class ActiveHours {
    startMonday!: Date
    endMonday!: Date
    startTuesday!: Date
    endTuesday!: Date
    startWednesday!: Date
    endWednesday!: Date
    startThursday!: Date
    endThursday!: Date
    startFriday!: Date
    endFriday!: Date
    startSaturday!: Date
    endSaturday!: Date
    startSunday!: Date
    endSunday!: Date
}