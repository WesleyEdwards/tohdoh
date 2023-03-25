import express, { Express, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticationMiddleware } from "../middleware/authentication_middleware";

export type Route = {
    path: string,
    method: "post" | "put" | "get" | "delete"
    endpointBuilder: (client: PrismaClient) => RequestHandler,
    skipAuth?: boolean
}

export const build_controller = (name:string, routes:Route[]) => (app: Express, client: PrismaClient) => {
    const router = express.Router();
    routes.forEach(route => {
        if (!route.skipAuth) {
            router.use(route.path, (req, res, next) => {
                if (req.method.toLowerCase() === route.method) {
                    authenticationMiddleware(req,res,next);
                } else {
                    next();
                }
            });
        }
        router[route.method](route.path, route.endpointBuilder(client));
    });
    app.use(`/api/${name}`, router);
}