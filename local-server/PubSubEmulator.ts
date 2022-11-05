import * as Events from "events";
import { execSync, spawn, ChildProcess } from "child_process";

import { PubSub, Topic } from "@google-cloud/pubsub";
import { always, T } from "ramda";

import { PubSubPullHandlerConfig, PubSubPushHandlerConfig } from "./server";

const projectId = "spotify-application-356414";

const noop = always(null);

export class PubSubEmulator extends Events.EventEmitter {
  private emulatorChildProcess: ChildProcess;
  private pubsubClient: PubSub;
  private topics = new Map<string, Topic>();

  constructor(config: { port: number; killExistingProcessOnPort?: boolean }) {
    const { port, killExistingProcessOnPort = false } = config;
    super();
    const processesOnPort = execSync(
      `lsof -i :${port} | wc -l | xargs`
    ).toString("utf-8");
    if (String(processesOnPort).trim() !== "0") {
      if (!killExistingProcessOnPort) {
        throw new Error(`Port: ${port} is already in use`);
      } else {
        execSync(`lsof -t -i :${port} | xargs kill`);
      }
    }
    this.emulatorChildProcess = spawn(
      `gcloud beta emulators pubsub start --project=${projectId} --host-port=localhost:${port}`,
      { shell: true }
    );
    this.emulatorChildProcess?.stderr?.on("data", (chunk) =>
      this.emit("emulatorChildProcessStderr", chunk.toString())
    );
    this.emulatorChildProcess.stdout?.on("data", (chunk) =>
      this.emit("emulatorChildProcessStdout", chunk.toString())
    );
    this.pubsubClient = new PubSub({
      projectId,
      ...(port && { apiEndpoint: `localhost:${port}` }),
    });
  }

  async registerHandlers(
    handlerConfigs: (PubSubPullHandlerConfig | PubSubPushHandlerConfig)[]
  ): Promise<void> {
    for (const c of handlerConfigs) {
      let topic: Topic | undefined = this.topics.get(c.topic);
      if (topic === undefined) {
        [topic] = await this.pubsubClient.createTopic(c.topic);
        this.topics.set(c.topic, topic);
      }
      const [subscription] = await topic.createSubscription(
        `${c.topic}-${c.id}`
      );
      const filter = (c as PubSubPushHandlerConfig).filter || T;
      subscription.on("message", (event) => {
        console.log("### Message ###", {
          attributes: event.attributes
        }) //eslint-disable-line
        if (filter(event)) {
          c.handler(
            {
              body: {
                message: event,
              },
            } as any,
            {
              json: noop,
              send: noop,
            } as any
          );
        }
      });
    }
  }
}
