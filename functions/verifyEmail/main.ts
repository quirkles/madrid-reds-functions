import { request, GraphQLClient, gql } from 'graphql-request'
import {Request, Response} from '@google-cloud/functions-framework'
import fetch from "node-fetch";
import {CryptoService} from "../shared/services/crypto";
import {secrets} from "./secrets";
import {createLogger} from "../shared/logger";

// https://mr-dev-verify-email-wgvygz45ba-uc.a.run.app/?iv=1c773c6476df531206aa5cb788de7732&verificationToken=78aa94f99e004eb9c7f63791a68066399f5ebdd39f4f7ceeca293bf2e75d7e2410187ea547da616b4a126caae5230b4d45cda7188dbc56d2b9c3ff663a6a36d4


const ValidateTokenMutation = gql`
    mutation ValidateToken($emailAddress: String!, $secret: String!){
        verifyToken(emailAddress: $emailAddress, secret: $secret) {
            wasVerificationSuccessful,
            jwt,
            verificationError
        }
    }
`;

export async function verifyEmailHandler(req: Request, res: Response): Promise<Response> {
    const logger = createLogger(process.env.ENVIRONMENT !== 'local')
    const iv = req.query["iv"]
    if(!iv || typeof iv !== 'string') {
        throw new Error('iv string query param required')
    }

    const verificationToken = req.query["verificationToken"]
    if(!verificationToken || typeof verificationToken !== 'string') {
        throw new Error('verificationToken string query param required')
    }

    const cryptoService = new CryptoService(secrets.VERIFY_EMAIL_SECRET)

    const decryptedToken = await cryptoService.decrypt({
        encryptedInput: verificationToken,
        initializationVector: Buffer.from(iv, 'hex')
    })

    const {email, secret} = JSON.parse(decryptedToken)

    logger.info('decryptedToken', {decryptedToken})
    logger.info('mutation args', {email, secret})

    const client = new GraphQLClient(secrets.GQL_URL);

    const result = await client.request(ValidateTokenMutation, { emailAddress: email, secret })

    return res.json(result);
};

// http('main', verifyEmailHandler);
