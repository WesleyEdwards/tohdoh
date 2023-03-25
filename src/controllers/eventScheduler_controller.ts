import { Express, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { build_controller } from "../lib/controller_builder";

const getMine = (client: PrismaClient):RequestHandler =>
    async (req: RequestWithJWTBody, res) => {
        const user = await client.user.findFirst({
            where: {
                id: req.jwtBody?.userId
            }
        });
        res.json({ user });
    }

type CreateUserBody = {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    }

const createUser = (client: PrismaClient): RequestHandler =>
    async (req, res) => {
        const {email, password, firstName, lastName} = req.body as CreateUserBody;
        const passwordHash = await bcrypt.hash(password, 10)
        try {
            const user = await client.user.create({
              data: {
                firstName,
                lastName,
                email,
                passwordHash
              }
            });
            const token = jwt.sign({
                userId: user.id
            }, process.env.ENCRYPTION_KEY!!, {
                expiresIn: '5m'
            });
            res.json({ user, token });
        } catch (error) {
            res.status(403)
            res.json({user:null, token:null, error:"Cannot create a user with that email."})
        }

      }

      export const usersController = build_controller(
        "users",
        [
            {path: "/me", endpointBuilder:getMe, method: "get"},
            {path: "/", method: "post", endpointBuilder: createUser, skipAuth: true}
        ]
      )
