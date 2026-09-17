import test from 'node:test'
import assert from 'node:assert/strict'
import { initialDraft, validateDraft } from '../src/domain/draft.ts'

const valid = { ...initialDraft, recipientName: 'Demo Recipient', recipientEmail: 'demo@example.com', title: 'Design work', description: 'Three mockups', amount: '3500.00', startDate: '2026-10-01', completionDate: '2026-10-30', paymentTerms: 'Payment after delivery' }

test('valid draft accepts MYR decimals and optional empty details', () => {
  assert.deepEqual(validateDraft(valid), {})
  assert.deepEqual(validateDraft({ ...valid, completionDate: valid.startDate }), {})
})
test('amounts reject non-money values, zero, negatives and excess precision', () => {
  for (const amount of ['NaN', 'Infinity', '1e3', '-5', '0', '1.234', '3,500', '1000000000']) {
    assert.ok(validateDraft({ ...valid, amount }).amount, amount)
  }
})
test('dates reject impossible days and reversed ranges', () => {
  assert.ok(validateDraft({ ...valid, startDate: '2026-02-30' }).startDate)
  assert.ok(validateDraft({ ...valid, completionDate: '2026-09-30' }).completionDate)
})
test('whitespace fields, invalid addresses and oversized input are rejected', () => {
  assert.ok(validateDraft({ ...valid, recipientName: '   ' }).recipientName)
  assert.ok(validateDraft({ ...valid, recipientEmail: 'invalid' }).recipientEmail)
  assert.ok(validateDraft({ ...valid, title: 'x'.repeat(201) }).title)
})
