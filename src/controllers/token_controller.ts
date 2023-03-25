import { Express, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { build_controller } from "../lib/controller_builder";

type LoginBody = {
    email: string,
    password: string
  }
  const login = (client:PrismaClient):RequestHandler => async (req, res) => {
    const {email, password} = req.body as LoginBody;
    const user = await client.user.findFirst({
      where: {
        email,
      }
    })
    if (!user) {
      res.status(404).json({message: "invalid email or password"})
      return;
    }
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      res.status(404).json({message: "invalid email or password"})
      return;
    }
    const token = jwt.sign({
      userId: user.id
    },
    process.env.ENCRYPTION_KEY!!,
    {
      expiresIn: '120m'
    })
    res.status(200).json({user, token});
  }

  export const tokenController = build_controller(
    "token",
    [
        {path: "/", endpointBuilder:login, method:"post", skipAuth: true}
    ]
  )