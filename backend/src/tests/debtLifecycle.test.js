import test from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../config/db.js'

test('Core Debt Lifecycle Integration Test', async () => {
  // 1. Create Meal with 2 participants (Creditor = userA, Debtor = userB)
  const mealId = `test-m-${Date.now()}`
  const newMeal = {
    id: mealId,
    title: 'Test Integration Lunch',
    totalAmount: 100000,
    currency: 'LAK',
    paidBy: 'u-userA',
    participants: ['u-userA', 'u-userB'],
    splitType: 'EQUAL',
    splitDetails: { 'u-userA': 50000, 'u-userB': 50000 },
    createdAt: new Date().toISOString()
  }

  const createdMeal = await db.addMeal(newMeal)
  assert.equal(createdMeal.id, mealId)

  // 2. Generate Debt for Debtor
  const debtId = `test-p-${Date.now()}`
  const newDebt = {
    id: debtId,
    mealId,
    fromUser: 'u-userB',
    toUser: 'u-userA',
    amount: 50000,
    status: 'PENDING',
    proofImage: null,
    createdAt: new Date().toISOString()
  }

  const createdDebt = await db.addDebt(newDebt)
  assert.equal(createdDebt.status, 'PENDING')
  assert.equal(createdDebt.amount, 50000)

  // 3. Debtor Submits Slip Image
  const slipUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  const paidDebt = await db.updateDebt(debtId, {
    status: 'PAID',
    slipUrl,
    proofImage: slipUrl
  })
  assert.equal(paidDebt.status, 'PAID')
  assert.equal(paidDebt.proofImage, slipUrl)

  // 4. Creditor Approves Payment
  const verifiedDebt = await db.updateDebt(debtId, { status: 'VERIFIED' })
  assert.equal(verifiedDebt.status, 'VERIFIED')

  // 5. Cleanup test data
  await db.deleteMeal(mealId)
  const cleaned = await db.getDebtById(debtId)
  assert.equal(cleaned, undefined)
})
