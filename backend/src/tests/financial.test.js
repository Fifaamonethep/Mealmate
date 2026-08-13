import test from 'node:test'
import assert from 'node:assert/strict'
import { toSubunits, fromSubunits, calculateEqualSplit, simplifyDebts } from '../utils/financial.js'

test('Financial Subunit Precision Math', () => {
  // LAK precision (0 decimals)
  assert.equal(toSubunits(100, 'LAK'), 100)
  assert.equal(fromSubunits(100, 'LAK'), 100)

  // USD / THB precision (2 decimals)
  assert.equal(toSubunits(10.50, 'USD'), 1050)
  assert.equal(fromSubunits(1050, 'USD'), 10.50)

  // Avoid floating point inaccuracies (0.1 + 0.2 = 0.30000000000000004)
  assert.equal(toSubunits(0.1 + 0.2, 'USD'), 30)
  assert.equal(fromSubunits(30, 'USD'), 0.3)
})

test('Calculate Equal Split with Remainder Subunits', () => {
  // $10 USD split among 3 people: $3.34, $3.33, $3.33 -> sum = $10.00
  const shares = calculateEqualSplit({
    totalAmount: 10,
    currency: 'USD',
    participants: ['userA', 'userB', 'userC'],
    paidBy: 'userA'
  })

  assert.equal(shares['userA'], 3.34)
  assert.equal(shares['userB'], 3.33)
  assert.equal(shares['userC'], 3.33)

  const sum = shares['userA'] + shares['userB'] + shares['userC']
  assert.equal(Number(sum.toFixed(2)), 10.00)
})

test('Debt Netting Algorithm (Splitwise Style Simplification)', () => {
  // A owes B 100, B owes C 100 -> A owes C 100
  const originalDebts = [
    { fromUser: 'userA', toUser: 'userB', amount: 100 },
    { fromUser: 'userB', toUser: 'userC', amount: 100 }
  ]

  const simplified = simplifyDebts(originalDebts, 'USD')

  assert.equal(simplified.length, 1)
  assert.equal(simplified[0].fromUser, 'userA')
  assert.equal(simplified[0].toUser, 'userC')
  assert.equal(simplified[0].amount, 100)
})

test('Debt Netting with Multiple Circular Debts', () => {
  // A owes B 50, B owes C 50, C owes A 50 -> net balance everyone 0 -> 0 transactions
  const circularDebts = [
    { fromUser: 'userA', toUser: 'userB', amount: 50 },
    { fromUser: 'userB', toUser: 'userC', amount: 50 },
    { fromUser: 'userC', toUser: 'userA', amount: 50 }
  ]

  const simplified = simplifyDebts(circularDebts, 'USD')
  assert.equal(simplified.length, 0)
})
