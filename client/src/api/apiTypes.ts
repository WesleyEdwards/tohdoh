import {
  DueDateEventScheduler,
  ScheduledEventScheduler,
  UnscheduledEventScheduler,
} from "./models";

export type CreateUserBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type CreateEventSchedulerBaseBody = {
  name: string;
  latX: number;
  latY: number;
  duration: number;
  priority: number;
};

export type RepeatType = "WEEKLY" | "MONTHLY" | "YEARLY";
export type CreateRepeatInfoBody = {
  repeatType: RepeatType;
  days: number[];
};

export type CreateUnscheduledEventSchedulerBody = {
  repeatInfo: CreateRepeatInfoBody;
  baseInfo: CreateEventSchedulerBaseBody;
};

export type CreateScheduledEventSchedulerBody = {
  repeatInfo: CreateRepeatInfoBody;
  baseInfo: CreateEventSchedulerBaseBody;
  startDateTime: string;
  endDateTime: string;
};

export type CreateDueDateEventSchedulerBody = {
  baseInfo: CreateEventSchedulerBaseBody;
  dueDateTime: string;
  blockSize: number;
};

// Responses
export type GetMineRes = {
  unscheduledEventSchedulers: UnscheduledEventScheduler[];
  scheduledEventSchedulers: ScheduledEventScheduler[];
  dueDateEventSchedulers: DueDateEventScheduler[];
};
