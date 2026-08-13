import test from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../config/db.js'
import { requireGroupMember } from '../middleware/authMiddleware.js'
import { getGroupById } from '../controllers/groupsController.js'
import { getMealById } from '../controllers/mealsController.js'
import { sendSlip } from '../controllers/debtsController.js'

test('Group Authorization Security Guard Integration Test', async () => {
  const memberUserId = 'u-authorized-member'
  const nonMemberUserId = 'u-unauthorized-attacker'
  const groupId = `g-auth-test-${Date.now()}`

  await db.addGroup({
    id: groupId,
    name: 'Secret Authorization Group',
    ownerId: memberUserId,
    members: [memberUserId],
    createdAt: new Date().toISOString()
  })

  // 1. Test Authorized Member Request via Middleware -> proceed via next()
  let nextCalled = false
  let responseStatusCode = null
  let responseJson = null

  const memberReq = {
    user: { id: memberUserId, role: 'user' },
    params: { id: groupId }
  }
  const mockResMember = {
    status(code) { responseStatusCode = code; return this },
    json(data) { responseJson = data; return this }
  }

  await requireGroupMember(memberReq, mockResMember, () => { nextCalled = true })
  assert.equal(nextCalled, true, 'Member should be granted access to group')
  assert.equal(responseStatusCode, null, 'No error status should be returned for member')

  // 2. Test Non-Member Request via Middleware -> Reject with HTTP 403 Forbidden
  nextCalled = false
  responseStatusCode = null
  responseJson = null

  const nonMemberReq = {
    user: { id: nonMemberUserId, role: 'user' },
    params: { id: groupId }
  }
  const mockResNonMember = {
    status(code) { responseStatusCode = code; return this },
    json(data) { responseJson = data; return this }
  }

  await requireGroupMember(nonMemberReq, mockResNonMember, () => { nextCalled = true })
  assert.equal(nextCalled, false, 'Non-member access should NOT trigger next()')
  assert.equal(responseStatusCode, 403, 'Non-member request must return HTTP 403 Forbidden')
  assert.ok(responseJson.message.includes('Access denied'), 'Error message must specify access denied')

  // 3. Test Meal Belonging to Group Security Lookup
  const mealId = `m-auth-test-${Date.now()}`
  await db.addMeal({
    id: mealId,
    groupId,
    title: 'Secret Group Lunch',
    totalAmount: 50000,
    paidBy: memberUserId,
    participants: [memberUserId],
    createdAt: new Date().toISOString()
  })

  // Non-member trying to access meal under group -> 403 Forbidden
  nextCalled = false
  responseStatusCode = null
  responseJson = null

  const nonMemberMealReq = {
    user: { id: nonMemberUserId, role: 'user' },
    params: { id: mealId }
  }

  await requireGroupMember(nonMemberMealReq, mockResNonMember, () => { nextCalled = true })
  assert.equal(nextCalled, false, 'Non-member accessing group meal must NOT trigger next()')
  assert.equal(responseStatusCode, 403, 'Non-member accessing group meal must return 403 Forbidden')

  // 4. Test Controller Level Endpoint Protection (GET /api/groups/:id)
  responseStatusCode = null
  responseJson = null
  await getGroupById(nonMemberReq, mockResNonMember)
  assert.equal(responseStatusCode, 403, 'getGroupById controller must return 403 for non-members')

  // 5. Test Controller Level Endpoint Protection (GET /api/meals/:id)
  responseStatusCode = null
  responseJson = null
  await getMealById(nonMemberMealReq, mockResNonMember)
  assert.equal(responseStatusCode, 403, 'getMealById controller must return 403 for non-members')

  // 6. Test Controller Level Endpoint Protection (PUT /api/debts/:id/slip)
  const debtId = `p-auth-test-${Date.now()}`
  await db.addDebt({
    id: debtId,
    mealId,
    groupId,
    fromUser: memberUserId,
    toUser: memberUserId,
    amount: 25000,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  })

  responseStatusCode = null
  responseJson = null
  const nonMemberSlipReq = {
    user: { id: nonMemberUserId, role: 'user' },
    params: { id: debtId },
    body: { slipUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
  }
  await sendSlip(nonMemberSlipReq, mockResNonMember)
  assert.equal(responseStatusCode, 403, 'sendSlip controller must return 403 for non-members/unauthorized parties')

  // Cleanup
  await db.deleteMeal(mealId)
  await db.deleteGroup(groupId)
})
