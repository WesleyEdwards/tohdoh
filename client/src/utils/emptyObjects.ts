import { DueDateEventScheduler } from "@prisma/client";
import { CreateEventSchedulerBaseBody } from "../api/apiTypes";
export const emptyBaseBody: CreateEventSchedulerBaseBody = {
  name: "",
  latX: 0,
  latY: 0,
  duration: 0,
  priority: 0,
};
