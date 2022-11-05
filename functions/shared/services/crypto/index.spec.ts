import 'reflect-metadata'

import { CryptoService } from './index'

describe('crypto', () => {
  it('encrypts and decrypts a message', async () => {
    expect.assertions(2)
    const crypto = new CryptoService({ ENCRYPTION_SECRET: 'test-secret' } as any)
    const encrypted = await crypto.encryptString('test input')
    expect(typeof encrypted).toBe('string')
    const decrypted = await crypto.decryptString(encrypted)
    expect(decrypted).toBe('test input')
  })
})
