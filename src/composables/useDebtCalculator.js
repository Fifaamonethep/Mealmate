/**
 * ==============================================================================
 * MEALMATE - CUSTOM SPLIT & DEBT CALCULATOR COMPOSABLE / UTILITY
 * ==============================================================================
 * Provides pure computational logic and a reactive Vue composable for calculating
 * itemized meal splits with proportional tax, service charge, and discounts.
 */

import { computed, isRef, unref } from 'vue'

/**
 * Helper to safely round floating point monetary values.
 * @param {number} value - The numeric value to round.
 * @param {number} decimals - Decimal places (0 for LAK/VND, 2 for USD/THB).
 * @returns {number}
 */
export function roundCurrency(value, decimals = 2) {
  if (isNaN(value) || !isFinite(value)) return 0
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/**
 * Pure function to calculate itemized debts.
 * 
 * @param {Object} params
 * @param {Array<{ id: string, name: string, avatar?: string }>} params.people - Array of all people participating in the meal.
 * @param {Array<{ id?: string, name: string, price: number, sharedBy: string[] }>} params.items - Array of ordered dishes.
 * @param {string} params.payerId - ID of the person who paid the total bill.
 * @param {number} [params.taxPercent=0] - Percentage tax rate (e.g. 10 for 10% VAT).
 * @param {number} [params.serviceChargePercent=0] - Percentage service charge (e.g. 5 for 5%).
 * @param {number} [params.discountPercent=0] - Percentage bill discount (e.g. 10 for 10% off).
 * @param {number} [params.decimals=0] - Rounding decimal precision (default: 0 for whole currency units like LAK).
 * 
 * @returns {Object} Result object containing debts, userSummaries, and grand totals.
 */
export function calculateItemizedDebts({
  people = [],
  items = [],
  payerId = '',
  taxPercent = 0,
  serviceChargePercent = 0,
  discountPercent = 0,
  decimals = 0
}) {
  // 1. EDGE-CASE SANITIZATION
  const safePeople = Array.isArray(people) ? people : []
  const safeItems = Array.isArray(items) ? items : []
  const safePayerId = String(payerId || '').trim()

  const safeTaxRate = Math.max(0, Number(taxPercent) || 0) / 100
  const safeServiceRate = Math.max(0, Number(serviceChargePercent) || 0) / 100
  const safeDiscountRate = Math.max(0, Math.min(100, Number(discountPercent) || 0)) / 100

  const payer = safePeople.find(p => p.id === safePayerId) || { id: safePayerId, name: 'Payer' }

  // 2. INITIALIZE USER BREAKDOWN ACCUMULATORS
  /** @type {Record<string, { user: Object, subtotal: number, consumedItems: Array<{ itemName: string, fullPrice: number, splitCount: number, sharePrice: number }> }>} */
  const userMap = {}

  for (const person of safePeople) {
    if (!person || !person.id) continue
    userMap[person.id] = {
      user: person,
      subtotal: 0,
      consumedItems: []
    }
  }

  // 3. PROCESS EACH ITEM & SPLIT EQUALLY AMONG PARTICIPANTS
  let totalItemsSubtotal = 0

  for (const item of safeItems) {
    if (!item) continue
    const price = Math.max(0, Number(item.price) || 0)
    const sharedBy = Array.isArray(item.sharedBy) ? item.sharedBy.filter(id => userMap[id]) : []

    // If item has no price or no valid consumers, skip distribution
    if (price <= 0 || sharedBy.length === 0) continue

    totalItemsSubtotal += price
    const sharePrice = price / sharedBy.length

    for (const userId of sharedBy) {
      userMap[userId].subtotal += sharePrice
      userMap[userId].consumedItems.push({
        itemName: item.name || 'Unnamed Dish',
        fullPrice: price,
        splitCount: sharedBy.length,
        sharePrice: sharePrice
      })
    }
  }

  // 4. OVERALL BILL TOTALS (TAX, SERVICE CHARGE, DISCOUNT)
  const totalDiscount = totalItemsSubtotal * safeDiscountRate
  const subtotalAfterDiscount = Math.max(0, totalItemsSubtotal - totalDiscount)
  const totalTax = subtotalAfterDiscount * safeTaxRate
  const totalServiceCharge = subtotalAfterDiscount * safeServiceRate
  const grandTotal = subtotalAfterDiscount + totalTax + totalServiceCharge

  // 5. DISTRIBUTE TAX & SERVICE CHARGE PROPORTIONALLY PER USER
  const userSummaries = []
  const debts = []
  let payerPersonalShare = 0

  for (const person of safePeople) {
    if (!person || !person.id) continue
    const record = userMap[person.id]
    const userSubtotal = record ? record.subtotal : 0

    // Proportion of this user's consumption relative to the food subtotal
    const proportion = totalItemsSubtotal > 0 ? (userSubtotal / totalItemsSubtotal) : 0

    const userDiscount = totalDiscount * proportion
    const userSubtotalAfterDiscount = Math.max(0, userSubtotal - userDiscount)
    const userTax = totalTax * proportion
    const userServiceCharge = totalServiceCharge * proportion
    const userTotal = userSubtotalAfterDiscount + userTax + userServiceCharge

    const roundedSubtotal = roundCurrency(userSubtotal, decimals)
    const roundedTax = roundCurrency(userTax, decimals)
    const roundedServiceCharge = roundCurrency(userServiceCharge, decimals)
    const roundedDiscount = roundCurrency(userDiscount, decimals)
    const roundedTotal = roundCurrency(userTotal, decimals)

    const summaryItem = {
      userId: person.id,
      name: person.name || 'User',
      avatar: person.avatar || '',
      isPayer: person.id === safePayerId,
      subtotal: roundedSubtotal,
      discount: roundedDiscount,
      taxAmount: roundedTax,
      serviceChargeAmount: roundedServiceCharge,
      totalAmount: roundedTotal,
      consumedItems: record ? record.consumedItems : []
    }

    userSummaries.push(summaryItem)

    // If this person is the payer, record their personal consumption
    if (person.id === safePayerId) {
      payerPersonalShare = roundedTotal
    } else if (roundedTotal > 0) {
      // Non-payers who consumed items OWE the payer
      debts.push({
        id: `debt-${safePayerId}-${person.id}`,
        debtorId: person.id,
        debtorName: person.name || 'User',
        debtorAvatar: person.avatar || '',
        creditorId: safePayerId,
        creditorName: payer.name,
        subtotal: roundedSubtotal,
        discountAmount: roundedDiscount,
        taxAmount: roundedTax,
        serviceChargeAmount: roundedServiceCharge,
        amount: roundedTotal,
        consumedItems: summaryItem.consumedItems
      })
    }
  }

  const totalOwedToPayer = debts.reduce((sum, d) => sum + d.amount, 0)

  return {
    debts,
    userSummaries,
    summary: {
      itemsSubtotal: roundCurrency(totalItemsSubtotal, decimals),
      discountAmount: roundCurrency(totalDiscount, decimals),
      taxAmount: roundCurrency(totalTax, decimals),
      serviceChargeAmount: roundCurrency(totalServiceCharge, decimals),
      grandTotal: roundCurrency(grandTotal, decimals),
      totalOwedToPayer: roundCurrency(totalOwedToPayer, decimals),
      payerPersonalShare: roundCurrency(payerPersonalShare, decimals)
    }
  }
}

/**
 * Reactive Vue 3 Composable for Itemized Debt Calculation.
 * 
 * @param {Object} options - Reactive refs or plain values.
 * @param {import('vue').Ref<Array> | Array} options.people - Participants list.
 * @param {import('vue').Ref<Array> | Array} options.items - Items/dishes list.
 * @param {import('vue').Ref<string> | string} options.payerId - Payer's user ID.
 * @param {import('vue').Ref<number> | number} [options.taxPercent] - Tax percentage.
 * @param {import('vue').Ref<number> | number} [options.serviceChargePercent] - Service charge percentage.
 * @param {import('vue').Ref<number> | number} [options.discountPercent] - Discount percentage.
 * @param {number} [options.decimals=0] - Decimal precision.
 */
export function useDebtCalculator(options) {
  const calculationResult = computed(() => {
    return calculateItemizedDebts({
      people: unref(options.people),
      items: unref(options.items),
      payerId: unref(options.payerId),
      taxPercent: unref(options.taxPercent || 0),
      serviceChargePercent: unref(options.serviceChargePercent || 0),
      discountPercent: unref(options.discountPercent || 0),
      decimals: unref(options.decimals ?? 0)
    })
  })

  return {
    debts: computed(() => calculationResult.value.debts),
    userSummaries: computed(() => calculationResult.value.userSummaries),
    summary: computed(() => calculationResult.value.summary),
    calculate: calculateItemizedDebts
  }
}
