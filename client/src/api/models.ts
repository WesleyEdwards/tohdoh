type DateTime = string;

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  activeHours?: ActiveHours;
  scheduledSchedulers: ScheduledEventScheduler[];
  unscheduledSchedulers: UnscheduledEventScheduler[];
  dueDateSchedulers: DueDateEventScheduler[];
  events: Event[];
  procrastinationIndex: number;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type ActiveHours = {
  id: number;
  userId: number;
  user: User;
  startMonday: DateTime;
  endMonday: DateTime;
  startTuesday: DateTime;
  endTuesday: DateTime;
  startWednesday: DateTime;
  endWednesday: DateTime;
  startThursday: DateTime;
  endThursday: DateTime;
  startFriday: DateTime;
  endFriday: DateTime;
  startSaturday: DateTime;
  endSaturday: DateTime;
  startSunday: DateTime;
  endSunday: DateTime;
};

export type Event = {
  id: number;
  start: DateTime;
  end: DateTime;
  user: User;
  scheduler: EventSchedulerBase;
  userId: number;
  schedulerId: number;
  kind: string;
  complete: Boolean;
};

export type EventSchedulerBase = {
  id: number;
  name: string;
  latX: number;
  latY: number;
  travelTime: number;
  duration: number;
  doneScheduling: boolean;
  priority: number;
  lastScheduled: DateTime;
  events: Event[];
  scheduledEvent?: ScheduledEventScheduler;
  unscheduledEvent?: UnscheduledEventScheduler;
  dueDateEvent?: DueDateEventScheduler;
};

export type DueDateEventScheduler = {
  id: number;
  base: EventSchedulerBase;
  baseId: number;
  userId: number;
  user: User;
  dueDateTime: DateTime;
  blockSize: number;
  amountScheduled: number;
};

export type UnscheduledEventScheduler = {
  id: number;
  base: EventSchedulerBase;
  baseId: number;
  repeatId: number;
  userId: number;
  user: User;
  repeatInfo: RepeatInfo;
};

export type ScheduledEventScheduler = {
  id: number;
  base: EventSchedulerBase;
  baseId: number;
  userId: number;
  user: User;
  repeatId: number;
  repeatInfo: RepeatInfo;
  startDateTime: DateTime;
  endDateTime: DateTime;
};

export type RepeatInfo = {
  id: number;
  repeatType: string;
  days: string;
  unscheduled?: UnscheduledEventScheduler;
  scheduled?: ScheduledEventScheduler;
};
