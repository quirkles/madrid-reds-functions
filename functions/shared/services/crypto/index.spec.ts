import "reflect-metadata";

import { CryptoService } from "./index";

describe("crypto", () => {
  it("encrypts and decrypts a message", async () => {
    expect.assertions(2);
    const crypto = new CryptoService("test-secret");
    const encrypted = await crypto.encrypt({
      unencryptedInput: "test input",
    });
    expect(encrypted).toEqual({
      algorithmUsedToEncrypt: "aes-192-cbc",
      initializationVector: expect.any(Buffer),
      result: expect.any(String),
    });
    const decrypted = await crypto.decrypt({
      encryptedInput: encrypted.result,
      initializationVector: encrypted.initializationVector,
    });
    expect(decrypted).toBe("test input");
  });
});
