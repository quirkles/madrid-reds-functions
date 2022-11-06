import { LoggingWinston } from '@google-cloud/logging-winston'
import winston, { Logger, type transport } from 'winston'

export function createLogger (shouldLogToCloud: boolean, meta?: Record<string, string | number | boolean>): Logger {
    const transports: transport[] = [
        shouldLogToCloud ? new LoggingWinston() : new winston.transports.Console()
    ]

    return winston.createLogger({
        defaultMeta: meta || {},
        level: 'silly',
        transports
    })
}
