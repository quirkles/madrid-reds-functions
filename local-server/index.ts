import {HttpHandlerConfig, startServer} from "./server";
import {verifyEmailHandler} from "../functions/verifyEmail/main";

const serverConfig = {
  httpPort: 8080,
  pubsubPort: 4040,
  handlerConfigs: [
    {
      method: "GET",
      path: '/verifyEmailHandler',
      handler: verifyEmailHandler,
    } as HttpHandlerConfig,
  ],
};
startServer(serverConfig)
  .then(() => {
    console.log('Started dev server.') //eslint-disable-line
  })
  .catch(console.error);
