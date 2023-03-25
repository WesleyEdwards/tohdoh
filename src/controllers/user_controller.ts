import { Express, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { JWTBody, RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { build_controller } from "../lib/controller_builder";

const getMe =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const user = await client.user.findFirst({
      where: {
        id: req.jwtBody?.userId,
      },
    });
    res.json({ user });
  };

type CreateUserBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const createUser =
  (client: PrismaClient): RequestHandler =>
  async (req, res) => {
    const { email, password, firstName, lastName } = req.body as CreateUserBody;
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const user = await client.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
        },
      });
      const activeHours = await client.activeHours.create({
        data: {
          userId: user.id,
          startSunday: new Date(0, 0, 0, 9),
          endSunday: new Date(0, 0, 0, 17),
          startMonday: new Date(0, 0, 0, 9),
          endMonday: new Date(0, 0, 0, 17),
          startTuesday: new Date(0, 0, 0, 9),
          endTuesday: new Date(0, 0, 0, 17),
          startWednesday: new Date(0, 0, 0, 9),
          endWednesday: new Date(0, 0, 0, 17),
          startThursday: new Date(0, 0, 0, 9),
          endThursday: new Date(0, 0, 0, 17),
          startFriday: new Date(0, 0, 0, 9),
          endFriday: new Date(0, 0, 0, 17),
          startSaturday: new Date(0, 0, 0, 9),
          endSaturday: new Date(0, 0, 0, 17),
        },
      });
      const token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.ENCRYPTION_KEY!!,
        {
          expiresIn: "120m",
        }
      );
      res.json({ user, token });
    } catch (error) {
      res.status(403);
      res.json({
        user: null,
        token: null,
        error: "Cannot create a user with that email.",
      });
    }
  };
type setActiveHoursBody = {
  startSunday: string;
  endSunday: string;
  startMonday: string;
  endMonday: string;
  startTuesday: string;
  endTuesday: string;
  startWednesday: string;
  endWednesday: string;
  startThursday: string;
  endThursday: string;
  startFriday: string;
  endFriday: string;
  startSaturday: string;
  endSaturday: string;
};
const setActiveHours =
  (client: PrismaClient): RequestHandler =>
  async (req: RequestWithJWTBody, res) => {
    const {
      startSunday,
      endSunday,
      startMonday,
      endMonday,
      startTuesday,
      endTuesday,
      startWednesday,
      endWednesday,
      startThursday,
      endThursday,
      startFriday,
      endFriday,
      startSaturday,
      endSaturday,
    } = req.body as setActiveHoursBody;
    try {
      const newAH = await client.activeHours.update({
        where: {
          userId: req.jwtBody!!.userId,
        },
        data: {
          startSunday: new Date(startSunday),
          endSunday: new Date(endSunday),
          startMonday: new Date(startMonday),
          endMonday: new Date(endMonday),
          startTuesday: new Date(startTuesday),
          endTuesday: new Date(endTuesday),
          startWednesday: new Date(startWednesday),
          endWednesday: new Date(endWednesday),
          startThursday: new Date(startThursday),
          endThursday: new Date(endThursday),
          startFriday: new Date(startFriday),
          endFriday: new Date(endFriday),
          startSaturday: new Date(startSaturday),
          endSaturday: new Date(endSaturday),
        },
      });
      res.json({ activeHours: newAH });
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json({
        user: null,
        token: null,
        error: "Could not update Active Hours.",
      });
    }
  };
export const usersController = build_controller("users", [
  { path: "/me", endpointBuilder: getMe, method: "get" },
  { path: "/", method: "post", endpointBuilder: createUser, skipAuth: true },
  { path: "/activeHours", method: "put", endpointBuilder: setActiveHours },
]);
