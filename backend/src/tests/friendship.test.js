import test from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../config/db.js'

test('Friendship State Machine Integration Test', async () => {
  const userA = 'u-testA'
  const userB = 'u-testB'

  // Ensure test users exist in DB
  let uA = await db.getUserById(userA)
  if (!uA) {
    await db.addUser({ id: userA, username: 'testA', passwordHash: '123', name: 'Test User A' })
  }
  let uB = await db.getUserById(userB)
  if (!uB) {
    await db.addUser({ id: userB, username: 'testB', passwordHash: '123', name: 'Test User B' })
  }

  // 1. Initial State: No friendship
  const friendships = await db.getFriendships()
  const existing = friendships.find(f => (f.user_id_1 === userA && f.user_id_2 === userB) || (f.user_id_1 === userB && f.user_id_2 === userA))
  if (existing) {
    await db.deleteFriendship(existing.id)
  }

  // 2. Send Friend Request (A -> B)
  const friendshipId = `f-test-${Date.now()}`
  const pair1 = userA < userB ? { user_id_1: userA, user_id_2: userB } : { user_id_1: userB, user_id_2: userA }
  const created = await db.addFriendship({
    id: friendshipId,
    user_id_1: pair1.user_id_1,
    user_id_2: pair1.user_id_2,
    status: 'pending',
    requested_by: userA,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  assert.equal(created.status, 'pending')
  assert.equal(created.requested_by, userA)

  // 3. Accept Friend Request
  const updated = await db.updateFriendship(friendshipId, {
    status: 'accepted',
    updated_at: new Date().toISOString()
  })
  assert.equal(updated.status, 'accepted')

  // 4. Verify Friend List contains userB for userA
  const allFriendships = await db.getFriendships()
  const acceptedPair = allFriendships.find(f => f.id === friendshipId)
  assert.equal(acceptedPair.status, 'accepted')

  // 5. Cleanup
  await db.deleteFriendship(friendshipId)
  const cleaned = (await db.getFriendships()).find(f => f.id === friendshipId)
  assert.equal(cleaned, undefined)
})
