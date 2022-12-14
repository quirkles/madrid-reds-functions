import { GraphQLClient, gql } from "graphql-request";
import { Request, Response } from "@google-cloud/functions-framework";
import { CryptoService } from "../shared/services/crypto";
import { secrets } from "./secrets";
import { createLogger } from "../shared/logger";

const ValidateTokenMutation = gql`
  mutation ValidateToken($emailAddress: String!, $secret: String!) {
    verifyToken(emailAddress: $emailAddress, secret: $secret) {
      wasVerificationSuccessful
      jwt
      verificationError
    }
  }
`;

export async function verifyEmailHandler(
  req: Request,
  res: Response
): Promise<Response> {
  const logger = createLogger(process.env.ENVIRONMENT !== "local");
  const iv = req.query.iv;
  if (!iv || typeof iv !== "string") {
    throw new Error("iv string query param required");
  }

  const verificationToken = req.query.verificationToken;
  if (!verificationToken || typeof verificationToken !== "string") {
    throw new Error("verificationToken string query param required");
  }

  const cryptoService = new CryptoService(secrets.VERIFY_EMAIL_SECRET);

  const decryptedToken = await cryptoService.decrypt({
    encryptedInput: verificationToken,
    initializationVector: Buffer.from(iv, "hex"),
  });

  const { email, secret } = JSON.parse(decryptedToken);

  logger.info("decryptedToken", { decryptedToken });
  logger.info("mutation args", { email, secret });

  const client = new GraphQLClient(secrets.GQL_URL);

  const result = await client.request(ValidateTokenMutation, {
    emailAddress: email,
    secret,
  });

  return res.json(result);
}

// http('main', verifyEmailHandler);
