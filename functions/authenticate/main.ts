import { GraphQLClient, gql } from "graphql-request";
import { Request, Response } from "@google-cloud/functions-framework";
import { CryptoService } from "../shared/services/crypto";
import { secrets } from "./secrets";
import { createLogger } from "../shared/logger";

const AuthenticateMutation = gql`
  mutation Authenticate($emailAddress: String!, $secret: String!) {
    authenticateSignInToken(emailAddress: $emailAddress, secret: $secret) {
      wasAuthenticationSuccessful
      jwt
      authenticationError
    }
  }
`;

export async function authenticateHandler(
  req: Request,
  res: Response
): Promise<Response> {
  const logger = createLogger(process.env.ENVIRONMENT !== "local");
  const iv = req.query.iv;
  if (!iv || typeof iv !== "string") {
    throw new Error("iv string query param required");
  }

  const authenticationToken = req.query.authenticationToken;
  if (!authenticationToken || typeof authenticationToken !== "string") {
    throw new Error("authenticationToken string query param required");
  }

  const cryptoService = new CryptoService(secrets.AUTHENTICATE_SECRET);

  const decryptedToken = await cryptoService.decrypt({
    encryptedInput: authenticationToken,
    initializationVector: Buffer.from(iv, "hex"),
  });

  const { email, secret } = JSON.parse(decryptedToken);

  logger.info("decryptedToken", { decryptedToken });
  logger.info("mutation args", { email, secret });

  const client = new GraphQLClient(secrets.GQL_URL);

  const result = await client.request(AuthenticateMutation, {
    emailAddress: email,
    secret,
  });

  return res.json(result);
}

// http('main', verifyEmailHandler);
