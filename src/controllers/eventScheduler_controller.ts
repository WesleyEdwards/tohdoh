import { Express, RequestHandler } from "express";
import { PrismaClient, RepeatInfo } from "@prisma/client";
import { RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { build_controller } from "../lib/controller_builder";

const getMine =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const rawUnscheduledEventSchedulers =
      await client.unscheduledEventScheduler.findMany({
        where: {
          userId: req.jwtBody?.userId,
        },
      });
    const unscheduledEventSchedulers = await Promise.all(rawUnscheduledEventSchedulers.map(async es => {
      const repeat = await client.repeatInfo.findFirst({where: {id:es.repeatId}});
      const base = await client.eventSchedulerBase.findFirst({where: {id:es.baseId}});
      return {id: es.id, repeat, base, userId: es.userId}
    }))
    const rawScheduledEventSchedulers =
      await client.scheduledEventScheduler.findMany({
        where: {
          userId: req.jwtBody?.userId,
        },
      });
    const scheduledEventSchedulers = await Promise.all(rawScheduledEventSchedulers.map(async es => {
        const repeat = await client.repeatInfo.findFirst({where: {id:es.repeatId}});
        const base = await client.eventSchedulerBase.findFirst({where: {id:es.baseId}});
        return {id: es.id, repeat, base, userId: es.userId, startDateTime:es.startDateTime, endDateTime:es.endDateTime}
      }))
    const rawDueDateEventSchedulers = await client.dueDateEventScheduler.findMany({
      where: {
        userId: req.jwtBody?.userId,
      },
    });
    const dueDateEventSchedulers = await Promise.all(rawDueDateEventSchedulers.map(async es => {
      const base = await client.eventSchedulerBase.findFirst({where: {id:es.baseId}});
      return {id: es.id, base, userId: es.userId, dueDateTime:es.dueDateTime, blockSize:es.blockSize, amountScheduled:es.amountScheduled}
    }))
    res.json({
      unscheduledEventSchedulers,
      scheduledEventSchedulers,
      dueDateEventSchedulers,
    });
  };
  type createRepeatInfoBody = {
    repeatType: "WEEKLY" | "MONTHLY" | "YEARLY";
    days: number[];
  };
  const createRepeatInfo = async (
    info: createRepeatInfoBody,
    client: PrismaClient
    ): Promise<number> => {
      const { repeatType, days } = info;
  const daysString = days.join(",");
  const newRepeatInfo = await client.repeatInfo.create({
    data: {
      repeatType,
      days: daysString,
    },
  });
  return newRepeatInfo.id;
};
const updateRepeatInfo = async (
  id: number,
  info: createRepeatInfoBody,
  client: PrismaClient
  ): Promise<number> => {
    const { repeatType, days } = info;
  const daysString = days.join(",");
  const newRepeatInfo = await client.repeatInfo.update({
    where: {
      id,
    },
    data: {
      repeatType,
      days: daysString,
    },
  });
  return newRepeatInfo.id;
};
type createUnscheduledEventSchedulerBody = {
  repeatInfo: createRepeatInfoBody;
  baseInfo: createEventSchedulerBaseBody;
};

type createEventSchedulerBaseBody = {
  name: string;
  latX: number;
  latY: number;
  duration: number;
  priority: number;
};

const createEventSchedulerBase = async (
  base: createEventSchedulerBaseBody,
  client: PrismaClient
  ): Promise<number> => {
    const { name, latX, latY, duration, priority } = base;
  const newBase = await client.eventSchedulerBase.create({
    data: {
      name,
      latX,
      latY,
      duration,
      priority,
      travelTime: 0,
      doneScheduling: false,
      lastScheduled: new Date(0),
    },
  });
  return newBase.id;
};
const updateEventSchedulerBase = async (
  id: number,
  base: createEventSchedulerBaseBody,
  client: PrismaClient
): Promise<number> => {
  const { name, latX, latY, duration, priority } = base;
  const newBase = await client.eventSchedulerBase.update({
    where: {
      id,
    },
    data: {
      name,
      latX,
      latY,
      duration,
      priority,
      travelTime: 0,
    },
  });
  return newBase.id;
};
const createUnscheduledEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const { repeatInfo, baseInfo } =
      req.body as createUnscheduledEventSchedulerBody;
    try {
      const baseId = await createEventSchedulerBase(baseInfo, client);
      const repeatId = await createRepeatInfo(repeatInfo, client);
      const unscheduledEventScheduler =
        await client.unscheduledEventScheduler.create({
          data: {
            baseId,
            repeatId,
            userId: req.jwtBody!!.userId,
          },
        });
      res.json({ unscheduledEventScheduler });
    } catch (error) {
      res.status(400);
      res.json({
        unscheduledEventScheduler: null,
        error: "Cannot create EventScheduler.",
      });
    }
  };
const updateUnscheduledEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const { repeatInfo, baseInfo } =
      req.body as createUnscheduledEventSchedulerBody;
    try {
      const oldES = await client.unscheduledEventScheduler.findFirst({
        where: {
          userId: req.jwtBody!!.userId,
          id: parseInt(req.params.id),
        },
      });
      if (!oldES) {
        res.status(404).json({ message: "unScheduledScheduler Not found" });
        return;
      }
      const baseId = await updateEventSchedulerBase(
        oldES.baseId,
        baseInfo,
        client
      );
      const repeatId = await updateRepeatInfo(
        oldES.repeatId,
        repeatInfo,
        client
      );
      res.json({ dueDateEventScheduler: oldES });
    } catch (error) {
      res.status(400);
      res.json({
        unscheduledEventScheduler: null,
        error: "Cannot update EventScheduler.",
      });
    }
  };
const deleteUnscheduledEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const scheduledEventScheduler =
      await client.scheduledEventScheduler.findFirst({
        where: {
          userId: req.jwtBody?.userId,
          id: parseInt(req.params.id),
        },
      });

    if (!scheduledEventScheduler) {
      res.status(404).json({ message: "ScheduledScheduler Not found" });
    } else {
      client.eventSchedulerBase.delete({
        where: {
          id: scheduledEventScheduler.baseId,
        },
      });
      client.repeatInfo.delete({
        where: {
          id: scheduledEventScheduler.repeatId,
        },
      });
      client.dueDateEventScheduler.delete({
        where: {
          id: scheduledEventScheduler.id,
        },
      });
      res.json({ message: "Deleted Successfully.", scheduledEventScheduler });
    }
  };
type createScheduledEventSchedulerBody = {
  repeatInfo: createRepeatInfoBody;
  baseInfo: createEventSchedulerBaseBody;
  startDateTime: string;
  endDateTime: string;
};
const createScheduledEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const { repeatInfo, baseInfo, startDateTime, endDateTime } =
      req.body as createScheduledEventSchedulerBody;
    try {
      const baseId = await createEventSchedulerBase(baseInfo, client);
      const repeatId = await createRepeatInfo(repeatInfo, client);
      const scheduledEventScheduler =
        await client.scheduledEventScheduler.create({
          data: {
            baseId,
            repeatId,
            userId: req.jwtBody!!.userId,
            endDateTime: new Date(endDateTime),
            startDateTime: new Date(startDateTime),
          },
        });
      res.json({ scheduledEventScheduler });
    } catch (error) {
      res.status(400);
      res.json({
        unscheduledEventScheduler: null,
        error: "Cannot create EventScheduler.",
      });
    }
  };
const updateScheduledEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const { repeatInfo, baseInfo, startDateTime, endDateTime } =
      req.body as createScheduledEventSchedulerBody;
    try {
      const oldES = await client.scheduledEventScheduler.findFirst({
        where: {
          userId: req.jwtBody!!.userId,
          id: parseInt(req.params.id),
        },
      });
      if (!oldES) {
        res.status(404).json({ message: "ScheduledScheduler Not found" });
        return;
      }
      const baseId = await updateEventSchedulerBase(
        oldES.baseId,
        baseInfo,
        client
      );
      const repeatId = await updateRepeatInfo(
        oldES.repeatId,
        repeatInfo,
        client
      );
      const scheduledEventScheduler =
        await client.scheduledEventScheduler.update({
          where: {
            id: oldES.id,
          },
          data: {
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
          },
        });
      res.json({ dueDateEventScheduler: scheduledEventScheduler });
    } catch (error) {
      res.status(400);
      res.json({
        unscheduledEventScheduler: null,
        error: "Cannot update EventScheduler.",
      });
    }
  };
const deleteScheduledEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const scheduledEventScheduler =
      await client.scheduledEventScheduler.findFirst({
        where: {
          userId: req.jwtBody?.userId,
          id: parseInt(req.params.id),
        },
      });

    if (!scheduledEventScheduler) {
      res.status(404).json({ message: "ScheduledScheduler Not found" });
    } else {
      client.eventSchedulerBase.delete({
        where: {
          id: scheduledEventScheduler.baseId,
        },
      });
      client.repeatInfo.delete({
        where: {
          id: scheduledEventScheduler.repeatId,
        },
      });
      client.dueDateEventScheduler.delete({
        where: {
          id: scheduledEventScheduler.id,
        },
      });
      res.json({ message: "Deleted Successfully.", scheduledEventScheduler });
    }
  };
type createDueDateEventSchedulerBody = {
  baseInfo: createEventSchedulerBaseBody;
  dueDateTime: string;
  blockSize: number;
};
const createDueDateEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const { baseInfo, dueDateTime, blockSize } =
      req.body as createDueDateEventSchedulerBody;
    try {
      const baseId = await createEventSchedulerBase(baseInfo, client);
      const dueDateEventScheduler = await client.dueDateEventScheduler.create({
        data: {
          baseId,
          userId: req.jwtBody!!.userId,
          dueDateTime: new Date(dueDateTime),
          blockSize,
          amountScheduled: 0,
        },
      });
      res.json({ dueDateEventScheduler });
    } catch (error) {
      res.status(400);
      res.json({
        unscheduledEventScheduler: null,
        error: "Cannot create EventScheduler.",
      });
    }
  };
const updateDueDateEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const { baseInfo, dueDateTime, blockSize } =
      req.body as createDueDateEventSchedulerBody;
    try {
      const oldES = await client.dueDateEventScheduler.findFirst({
        where: {
          userId: req.jwtBody!!.userId,
          id: parseInt(req.params.id),
        },
      });
      if (!oldES) {
        res.status(404).json({ message: "DueDateScheduler Not found" });
        return;
      }
      const baseId = await updateEventSchedulerBase(
        oldES.baseId,
        baseInfo,
        client
      );
      const dueDateEventScheduler = await client.dueDateEventScheduler.update({
        where: {
          id: oldES.id,
        },
        data: {
          dueDateTime: new Date(dueDateTime),
          blockSize,
        },
      });
      res.json({ dueDateEventScheduler });
    } catch (error) {
      res.status(400);
      res.json({
        unscheduledEventScheduler: null,
        error: "Cannot update EventScheduler.",
      });
    }
  };
const deleteDueDateEventScheduler =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const dueDateEventScheduler = await client.dueDateEventScheduler.findFirst({
      where: {
        userId: req.jwtBody?.userId,
        id: parseInt(req.params.id),
      },
    });

    if (!dueDateEventScheduler) {
      res.status(404).json({ message: "DueDateScheduler Not found" });
    } else {
      client.eventSchedulerBase.delete({
        where: {
          id: dueDateEventScheduler.baseId,
        },
      });
      client.dueDateEventScheduler.delete({
        where: {
          id: dueDateEventScheduler.id,
        },
      });
      res.json({ message: "Deleted Successfully.", dueDateEventScheduler });
    }
  };

export const eventSchedulerController = build_controller("eventSchedulers", [
  { path: "/me", endpointBuilder: getMine, method: "get" },
  {
    path: "/unscheduledEventScheduler",
    method: "post",
    endpointBuilder: createUnscheduledEventScheduler,
  },
  {
    path: "/scheduledEventScheduler",
    method: "post",
    endpointBuilder: createScheduledEventScheduler,
  },
  {
    path: "/dueDateEventScheduler",
    method: "post",
    endpointBuilder: createDueDateEventScheduler,
  },
  {
    path: "/unscheduledEventScheduler/:id",
    method: "delete",
    endpointBuilder: deleteUnscheduledEventScheduler,
  },
  {
    path: "/scheduledEventScheduler/:id",
    method: "delete",
    endpointBuilder: deleteScheduledEventScheduler,
  },
  {
    path: "/dueDateEventScheduler/:id",
    method: "delete",
    endpointBuilder: deleteDueDateEventScheduler,
  },
  {
    path: "/unscheduledEventScheduler/:id",
    method: "put",
    endpointBuilder: updateUnscheduledEventScheduler,
  },
  {
    path: "/scheduledEventScheduler/:id",
    method: "put",
    endpointBuilder: updateScheduledEventScheduler,
  },
  {
    path: "/dueDateEventScheduler/:id",
    method: "put",
    endpointBuilder: updateDueDateEventScheduler,
  },
]);
