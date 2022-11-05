import { Router } from "express";
import {Logger} from "winston";

import { HttpHandlerConfig, PubSubPullHandlerConfig } from "./server";

export function initHttpHandlerRoutes(
  handlerConfigs: HttpHandlerConfig[],
  logger: Logger
): Router {
  const router = Router();
  for (const config of handlerConfigs) {
    const { method, path, handler } = config;
    switch (method) {
      case "GET":
        console.log(`GET ${path} handler: ${handler.name} initialized`)
        router.get(path, async (req, res, next) => {
          try {
            return (await handler(req, res))
          } catch (e) {
            logger.error(`GET ${path} handler error: ${(e as Error).message}`)
            return res.status(500).send((e as Error).message)
          }
        });
        break;
      case "POST":
        console.log(`GET ${path} handler: ${handler.name} initialized`)
        router.post(path, async (req, res, next) => {
          try {
            return (await handler(req, res))
          } catch (e) {
            logger.error(`POST ${path} handler error: ${(e as Error).message}`)
            return res.status(500).send((e as Error).message)
          }
        });
        break;
    }
  }
  return router;
}
