/**
 * Financial Utility Module — Precision split calculation & Debt Netting algorithm
 */

export function getCurrencyDecimals(currency = 'LAK') {
  const code = (currency || 'LAK').toUpperCase()
  if (code === 'LAK' || code === 'VND') return 0
  return 2
}

export function toSubunits(amount, currency = 'LAK') {
  const decimals = getCurrencyDecimals(currency)
  const factor = Math.pow(10, decimals)
  return Math.round(Number(amount || 0) * factor)
}

export function fromSubunits(subunits, currency = 'LAK') {
  const decimals = getCurrencyDecimals(currency)
  const factor = Math.pow(10, decimals)
  const val = Number(subunits || 0) / factor
  return decimals === 0 ? Math.round(val) : Number(val.toFixed(decimals))
}

/**
 * Calculates equal split per participant without floating point drift or loss of cents.
 */
export function calculateEqualSplit({ totalAmount, currency = 'LAK', participants = [], paidBy }) {
  if (!participants || participants.length === 0) return []

  const totalSubunits = toSubunits(totalAmount, currency)
  const count = participants.length
  const baseShareSubunits = Math.floor(totalSubunits / count)
  let remainderSubunits = totalSubunits - (baseShareSubunits * count)

  const shares = {}
  for (const userId of participants) {
    let userSubunits = baseShareSubunits
    if (remainderSubunits > 0) {
      userSubunits += 1
      remainderSubunits -= 1
    }
    shares[userId] = fromSubunits(userSubunits, currency)
  }

  return shares
}

/**
 * Simplifies a set of debts into the minimal number of transactions (Splitwise Debt Netting algorithm).
 * @param {Array<{fromUser: string, toUser: string, amount: number}>} debts 
 * @param {string} currency 
 * @returns {Array<{fromUser: string, toUser: string, amount: number}>}
 */
export function simplifyDebts(debts = [], currency = 'LAK') {
  if (!Array.isArray(debts) || debts.length === 0) return []

  // 1. Calculate net balances (in subunits)
  const balances = {} // userId -> net subunits (positive = creditor, negative = debtor)

  for (const d of debts) {
    if (!d.fromUser || !d.toUser || d.fromUser === d.toUser) continue
    const amtSubunits = toSubunits(d.amount, currency)
    if (amtSubunits <= 0) continue

    balances[d.fromUser] = (balances[d.fromUser] || 0) - amtSubunits
    balances[d.toUser] = (balances[d.toUser] || 0) + amtSubunits
  }

  // 2. Separate into debtors and creditors
  const debtors = []   // { userId, netDebtSubunits } (positive number)
  const creditors = [] // { userId, netCreditSubunits } (positive number)

  for (const [userId, net] of Object.entries(balances)) {
    if (net < 0) {
      debtors.push({ userId, netDebt: -net })
    } else if (net > 0) {
      creditors.push({ userId, netCredit: net })
    }
  }

  // Sort descending to optimize greedy matching
  debtors.sort((a, b) => b.netDebt - a.netDebt)
  creditors.sort((a, b) => b.netCredit - a.netCredit)

  // 3. Greedy matching to minimize transactions
  const simplified = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const settleSubunits = Math.min(debtor.netDebt, creditor.netCredit)
    if (settleSubunits > 0) {
      simplified.push({
        fromUser: debtor.userId,
        toUser: creditor.userId,
        amount: fromSubunits(settleSubunits, currency)
      })
    }

    debtor.netDebt -= settleSubunits
    creditor.netCredit -= settleSubunits

    if (debtor.netDebt === 0) i++
    if (creditor.netCredit === 0) j++
  }

  return simplified
}
