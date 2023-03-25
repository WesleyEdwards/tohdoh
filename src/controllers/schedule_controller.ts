import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import { build_controller } from "../lib/controller_builder";

const getSchedule =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    let scheduleICal:string = "";
    // TODO:Generate Schedule
    res.set({"Content-Disposition":"attachment; filename=\"newEvents.ics\"","Content-type":"text/calendar"});
    res.send(scheduleICal);
  };

export const scheduleController = build_controller("schedules", [
    { path: "/", endpointBuilder: getSchedule, method: "get" },
  ]);