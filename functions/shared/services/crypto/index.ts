import * as crypto from "crypto";

interface EncryptionResult {
  result: string;
  initializationVector: Buffer;
  algorithmUsedToEncrypt: "aes-192-cbc";
}

interface EncryptionParams {
  unencryptedInput: string;
  initializationVector?: Buffer;
  algorithmUsedToEncrypt?: "aes-192-cbc";
}

interface DecryptionParams {
  encryptedInput: string;
  initializationVector: Buffer;
  algorithmUsedToEncrypt?: "aes-192-cbc";
}

export interface ICryptoService {
  encrypt(params: EncryptionParams): Promise<EncryptionResult>;
  decrypt(params: DecryptionParams): Promise<string>;
  generateSecret(length?: number): string;
}

class CryptoService implements ICryptoService {
  private defaultAlgorithm = "aes-192-cbc" as const;
  private encryptionKey: Buffer;

  constructor(encryptionSecret: string) {
    this.encryptionKey = crypto.scryptSync(encryptionSecret, "salt", 24);
  }

  async encrypt(params: EncryptionParams): Promise<EncryptionResult> {
    const initializationVector =
      params.initializationVector || crypto.randomFillSync(Buffer.alloc(16, 0));
    const algorithm = params.algorithmUsedToEncrypt || this.defaultAlgorithm;
    const key = this.encryptionKey;
    return new Promise((resolve, reject) => {
      // Create Cipher with key and iv
      const cipher = crypto.createCipheriv(
        algorithm,
        key,
        initializationVector
      );

      let encrypted = "";
      cipher.setEncoding("hex");

      cipher.on("data", (chunk) => {
        encrypted += chunk;
      });
      cipher.on("end", () =>
        resolve({
          result: encrypted,
          initializationVector,
          algorithmUsedToEncrypt: algorithm,
        })
      ); // Prints encrypted data with key

      cipher.write(params.unencryptedInput);
      cipher.end();
    });
  }

  async decrypt(params: DecryptionParams): Promise<string> {
    const algorithm = params.algorithmUsedToEncrypt || this.defaultAlgorithm;
    const key = this.encryptionKey;
    const initializationVector = params.initializationVector;

    return new Promise((resolve, reject) => {
      // Create decipher with key and iv
      const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        initializationVector
      );

      let decrypted = "";
      decipher.on("readable", () => {
        let chunk: Buffer;
        while ((chunk = decipher.read()) !== null) {
          decrypted += chunk.toString("utf8");
        }
      });
      decipher.on("end", () => {
        return resolve(decrypted);
      });

      decipher.write(params.encryptedInput, "hex");
      decipher.end();
    });
  }

  generateSecret(length = 20): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }
}

export { CryptoService };
