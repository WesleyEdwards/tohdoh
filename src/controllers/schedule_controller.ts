import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import { build_controller } from "../lib/controller_builder";

const getSchedule =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    let scheduleICal: string = "";
    // TODO:Generate Schedule
    res.set({
      "Content-Disposition": 'attachment; filename="newEvents.ics"',
      "Content-type": "text/calendar",
    });
    res.send(scheduleICal);
  };

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
  { path: "/", endpointBuilder: getSchedule, method: "get" },
]);
