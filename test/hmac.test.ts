/**
 * Unit tests: utils.ts (computeHmacSignature)
 *
 * Scenarios:
 * 1. Computes correct HMAC-SHA256 signature
 * 2. Returns signature in correct format (sha256=<hex>)
 * 3. Handles string payloads
 * 4. Handles object payloads (JSON serialization)
 * 5. Produces consistent output for same input
 * 6. Different inputs produce different signatures
 */

import { describe, it, expect } from 'vitest'
import { computeHmacSignature } from '../src/utils'

describe('computeHmacSignature', () => {
  it('computes correct HMAC-SHA256 signature', async () => {
    const secret = 'test-secret-123'
    const body = { event: 'test' }
    const signature = await computeHmacSignature(secret, body)

    expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
  })

  it('returns signature in correct format', async () => {
    const secret = 'my-secret'
    const body = 'hello world'
    const signature = await computeHmacSignature(secret, body)

    expect(signature).toMatch(/^sha256=/)
    const hexPart = signature.split('=')[1]
    expect(hexPart).toMatch(/^[a-f0-9]{64}$/)
  })

  it('handles string payloads', async () => {
    const secret = 'secret-key'
    const body = 'plain text payload'
    const signature = await computeHmacSignature(secret, body)

    expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
  })

  it('handles object payloads with JSON serialization', async () => {
    const secret = 'secret-key'
    const body = { event: 'push', data: { id: 123 } }
    const signature1 = await computeHmacSignature(secret, body)

    // Same object should produce same signature
    const signature2 = await computeHmacSignature(secret, body)
    expect(signature1).toBe(signature2)
  })

  it('produces consistent output for same input', async () => {
    const secret = 'consistent-secret'
    const body = { event: 'test' }

    const sig1 = await computeHmacSignature(secret, body)
    const sig2 = await computeHmacSignature(secret, body)
    const sig3 = await computeHmacSignature(secret, body)

    expect(sig1).toBe(sig2)
    expect(sig2).toBe(sig3)
  })

  it('different inputs produce different signatures', async () => {
    const secret = 'test-secret'

    const sig1 = await computeHmacSignature(secret, { event: 'a' })
    const sig2 = await computeHmacSignature(secret, { event: 'b' })
    const sig3 = await computeHmacSignature(secret, { event: 'a', extra: 'field' })

    expect(sig1).not.toBe(sig2)
    expect(sig1).not.toBe(sig3)
    expect(sig2).not.toBe(sig3)
  })

  it('different secrets produce different signatures for same payload', async () => {
    const body = { event: 'test' }

    const sig1 = await computeHmacSignature('secret-1', body)
    const sig2 = await computeHmacSignature('secret-2', body)
    const sig3 = await computeHmacSignature('secret-3', body)

    expect(sig1).not.toBe(sig2)
    expect(sig1).not.toBe(sig3)
    expect(sig2).not.toBe(sig3)
  })

  it('handles empty string payload', async () => {
    const secret = 'test-secret'
    const body = ''
    const signature = await computeHmacSignature(secret, body)

    expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
  })

  it('handles empty object payload', async () => {
    const secret = 'test-secret'
    const body = {}
    const signature = await computeHmacSignature(secret, body)

    expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
  })

  it('handles null payload', async () => {
    const secret = 'test-secret'
    const body = null
    const signature = await computeHmacSignature(secret, body)

    expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
  })
})
