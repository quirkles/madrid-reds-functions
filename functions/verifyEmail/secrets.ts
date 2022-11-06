import {secretsLocal} from "./secrets.local";
import {secretsDev} from "./secrets.dev";
import {secretsProduction} from "./secrets.production";

export interface Secrets {
    VERIFY_EMAIL_SECRET: string
    GQL_URL: string
}

let secrets: Secrets

switch (process.env.ENVIRONMENT) {
    case 'local':
        secrets = secretsLocal
        break;
    case 'dev':
        secrets = secretsDev
        break;
    case 'production':
        secrets = secretsProduction
        break
}

export { secrets }
