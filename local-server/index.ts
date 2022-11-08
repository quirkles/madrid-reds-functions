import {HttpHandlerConfig, startServer} from "./server";
import {verifyEmailHandler} from "../functions/verifyEmail/main";
import {authenticateHandler} from "../functions/authenticate/main";

const serverConfig = {
  httpPort: 8080,
  pubsubPort: 4488,
  handlerConfigs: [
    {
      method: "GET",
      path: '/verifyEmailHandler',
      handler: verifyEmailHandler,
    } as HttpHandlerConfig,
    {
      method: "GET",
      path: '/authenticateHandler',
      handler: authenticateHandler,
    } as HttpHandlerConfig,
  ],
};
startServer(serverConfig)
  .then(() => {
    console.log('Started dev server.') //eslint-disable-line
  })
  .catch(console.error);
