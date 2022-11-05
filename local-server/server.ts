import type {Message} from "@google-cloud/pubsub";
import winston from "winston";
import {complement} from "ramda";
import express, {Request, Response} from "express";

import {initHttpHandlerRoutes} from "./initHttpHandlerRoutes";
import {PubSubEmulator} from "./PubSubEmulator";

type PubSubPullHandler = (message: Message) => Promise<unknown>;
type PubSubPushHandler = (
    request: Request,
    response: Response
) => Promise<unknown>;
type HttpHandler = (request: Request, response: Response) => Promise<unknown>;

export interface PubSubPullHandlerConfig {
    id: string;
    topic: string;
    handler: PubSubPullHandler;
}

export interface PubSubPushHandlerConfig {
    id: string;
    topic: string;
    filter: (message: Message) => boolean;
    handler: PubSubPushHandler;
}

export interface HttpHandlerConfig {
    method: "GET" | "POST";
    path: string;
    handler: HttpHandler;
}

interface ServerConfig {
    httpPort: number;
    pubsubPort: number;
    handlerConfigs: (
        | PubSubPullHandlerConfig
        | PubSubPushHandlerConfig
        | HttpHandlerConfig
        )[];
}

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.cli(),
                winston.format.timestamp(),
                winston.format.colorize({
                    all: true,
                    colors: {
                        error: "red",
                        info: "blue",
                    },
                }),
                winston.format.printf(({message, process = "", timestamp}) => {
                    return `${timestamp} [${process}]: ${message.replace(/\n+/, "")}`;
                })
            ),
        }),
    ],
});

const emulatorLogger = logger.child({process: "Emulator Child Process"});
const serverLogger = logger.child({process: "Dev Server"});
const httpHandlerLogger = logger.child({process: "Http handler"});

export function isHttpHandlerConfig(
    config: HttpHandlerConfig | PubSubPullHandlerConfig | PubSubPushHandlerConfig
): config is HttpHandlerConfig {
    const hasMethod = Boolean((config as HttpHandlerConfig).method);
    const hasPath = Boolean((config as HttpHandlerConfig).path);

    return hasMethod && hasPath;
}

export async function startServer(serverConfig: ServerConfig): Promise<void> {
    const {
        httpPort = 5001,
        pubsubPort = 8085,
        handlerConfigs = [],
    } = serverConfig;

    const httpHandlerRouter = initHttpHandlerRoutes(
        handlerConfigs.filter(isHttpHandlerConfig),
        httpHandlerLogger
    );

    const app = express();

    app.use(httpHandlerRouter);

    const pubSubEmulator = new PubSubEmulator({
        port: pubsubPort,
        killExistingProcessOnPort: true,
    });

    pubSubEmulator.on("emulatorChildProcessStderr", (msg) => {
        emulatorLogger.error(msg);
    });
    pubSubEmulator.on("emulatorChildProcessStdout", (msg) => {
        emulatorLogger.info(msg);
    });

    await pubSubEmulator.registerHandlers(
        handlerConfigs.filter(complement(isHttpHandlerConfig))
    );

    app.listen(httpPort, () => {
        serverLogger.info(`Http server listening on port ${httpPort}`);
    });
}
