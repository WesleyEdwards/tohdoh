import { Express, RequestHandler } from "express";
import { PrismaClient, RepeatInfo } from "@prisma/client";
import { RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { build_controller } from "../lib/controller_builder";

const getMine = (client: PrismaClient):RequestHandler =>
    async (req: RequestWithJWTBody, res) => {
        const unscheduledEventSchedulers = await client.unscheduledEventScheduler.findMany({
            where: {
                userId: req.jwtBody?.userId
            }
        });
        const scheduledEventSchedulers = await client.scheduledEventScheduler.findMany({
            where: {
                userId: req.jwtBody?.userId
            }
        });
        const dueDateEventSchedulers = await client.dueDateEventScheduler.findMany({
            where: {
                userId: req.jwtBody?.userId
            }
        });
        res.json({ unscheduledEventSchedulers, scheduledEventSchedulers, dueDateEventSchedulers });
    }
type createEventSchedulerBaseBody = {
    name: string,
    latX: number,
    latY: number,
    duration: number,
    priority: number,
}
type createRepeatInfoBody = {
    repeatType: "WEEKLY"|"MONTHLY"|"YEARLY",
    days: number[],
}
const createRepeatInfo = async (info: createRepeatInfoBody, client: PrismaClient): Promise<number> => {
    const {repeatType, days} = info;
    const daysString = days.join(",");
    const newRepeatInfo = await client.repeatInfo.create({
        data: {
            repeatType,
            "days":daysString
        }
    });
    return newRepeatInfo.id;
}
type createUnscheduledEventSchedulerBody = {
    repeatInfo: createRepeatInfoBody,
    baseInfo: createEventSchedulerBaseBody
    }

const createEventSchedulerBase =  async (base: createEventSchedulerBaseBody, client: PrismaClient): Promise<number> => {
    const {name, latX, latY, duration, priority} = base;
    const newBase = await client.eventSchedulerBase.create({
        data: {
            name,
            latX,
            latY,
            duration,
            priority,
            travelTime:0,
            doneScheduling:false,
            lastScheduled:new Date(0),
        }
    });
    return newBase.id;
}
const createUnscheduledEventScheduler = (client: PrismaClient): RequestHandler =>
    async (req:RequestWithJWTBody, res) => {
        const {repeatInfo, baseInfo} = req.body as createUnscheduledEventSchedulerBody;
        try {
            const baseId = await createEventSchedulerBase(baseInfo, client)
            const repeatId = await createRepeatInfo(repeatInfo, client)
            const unscheduledEventScheduler = await client.unscheduledEventScheduler.create({
              data: {
                baseId,
                repeatId,
                userId:req.jwtBody!!.userId
              }
            });
            res.json({unscheduledEventScheduler});
        } catch (error) {
            res.status(400)
            res.json({unscheduledEventScheduler:null, error:"Cannot create EventScheduler."})
        }

      }
const deleteUnscheduledEventScheduler = (client: PrismaClient): RequestHandler =>
      async (req:RequestWithJWTBody, res) => {
        const scheduledEventScheduler = await client.scheduledEventScheduler.findFirst({
            where: {
                userId: req.jwtBody?.userId,
                id: parseInt(req.params.id)
            }
        });

        if (!scheduledEventScheduler) {
            res.status(404).json({message:"ScheduledScheduler Not found"})
        } else {
            client.eventSchedulerBase.delete({
                where:{
                    id:scheduledEventScheduler.baseId
                }
            });
            client.repeatInfo.delete({
                where:{
                    id:scheduledEventScheduler.repeatId
                }
            })
            client.dueDateEventScheduler.delete({
                where:{
                    id:scheduledEventScheduler.id
                }
            })
            res.json({message:"Deleted Successfully.", scheduledEventScheduler})
        }
      }
type createScheduledEventSchedulerBody = {
        repeatInfo: createRepeatInfoBody,
        baseInfo: createEventSchedulerBaseBody,
        startDateTime: Date,
        endDateTime: Date
        }
const createScheduledEventScheduler = (client: PrismaClient): RequestHandler =>
    async (req:RequestWithJWTBody, res) => {
        const {repeatInfo, baseInfo, startDateTime, endDateTime} = req.body as createScheduledEventSchedulerBody;
        try {
            const baseId = await createEventSchedulerBase(baseInfo, client)
            const repeatId = await createRepeatInfo(repeatInfo, client)
            const scheduledEventScheduler = await client.scheduledEventScheduler.create({
              data: {
                baseId,
                repeatId,
                userId:req.jwtBody!!.userId,
                endDateTime,
                startDateTime,
              }
            });
            res.json({scheduledEventScheduler});
        } catch (error) {
            res.status(400)
            res.json({unscheduledEventScheduler:null, error:"Cannot create EventScheduler."})
        }
      }
const deleteScheduledEventScheduler = (client: PrismaClient): RequestHandler =>
      async (req:RequestWithJWTBody, res) => {
        const scheduledEventScheduler = await client.scheduledEventScheduler.findFirst({
            where: {
                userId: req.jwtBody?.userId,
                id: parseInt(req.params.id)
            }
        });

        if (!scheduledEventScheduler) {
            res.status(404).json({message:"ScheduledScheduler Not found"})
        } else {
            client.eventSchedulerBase.delete({
                where:{
                    id:scheduledEventScheduler.baseId
                }
            });
            client.repeatInfo.delete({
                where:{
                    id:scheduledEventScheduler.repeatId
                }
            })
            client.dueDateEventScheduler.delete({
                where:{
                    id:scheduledEventScheduler.id
                }
            })
            res.json({message:"Deleted Successfully.", scheduledEventScheduler})
        }
      }
type createDueDateEventSchedulerBody = {
        baseInfo: createEventSchedulerBaseBody,
        dueDateTime: Date,
        blockSize: number,
        }
const createDueDateEventScheduler = (client: PrismaClient): RequestHandler =>
    async (req:RequestWithJWTBody, res) => {
        const {baseInfo, dueDateTime, blockSize} = req.body as createDueDateEventSchedulerBody;
        try {
            const baseId = await createEventSchedulerBase(baseInfo, client)
            const dueDateEventScheduler = await client.dueDateEventScheduler.create({
              data: {
                baseId,
                userId:req.jwtBody!!.userId,
                dueDateTime,
                blockSize,
                amountScheduled:0
              }
            });
            res.json({dueDateEventScheduler});
        } catch (error) {
            res.status(400)
            res.json({unscheduledEventScheduler:null, error:"Cannot create EventScheduler."})
        }
      }
const deleteDueDateEventScheduler = (client: PrismaClient): RequestHandler =>
      async (req:RequestWithJWTBody, res) => {
        const dueDateEventScheduler = await client.dueDateEventScheduler.findFirst({
            where: {
                userId: req.jwtBody?.userId,
                id: parseInt(req.params.id)
            }
        });

        if (!dueDateEventScheduler) {
            res.status(404).json({message:"DueDateScheduler Not found"})
        } else {
            client.eventSchedulerBase.delete({
                where:{
                    id:dueDateEventScheduler.baseId
                }
            });
            client.dueDateEventScheduler.delete({
                where:{
                    id:dueDateEventScheduler.id
                }
            })
            res.json({message:"Deleted Successfully.", dueDateEventScheduler})
        }
      }


      export const eventSchedulerController = build_controller(
        "users",
        [
            {path: "/me", endpointBuilder:getMine, method: "get"},
            {path: "/unscheduledEventScheduler", method: "post", endpointBuilder: createUnscheduledEventScheduler},
            {path: "/scheduledEventScheduler", method: "post", endpointBuilder: createScheduledEventScheduler},
            {path: "/dueDateEventScheduler", method: "post", endpointBuilder: createDueDateEventScheduler},
            {path: "/unscheduledEventScheduler/:id", method: "delete", endpointBuilder: deleteUnscheduledEventScheduler},
            {path: "/scheduledEventScheduler/:id", method: "delete", endpointBuilder: deleteScheduledEventScheduler},
            {path: "/dueDateEventScheduler/:id", method: "delete", endpointBuilder: deleteDueDateEventScheduler},
        ]
      )
