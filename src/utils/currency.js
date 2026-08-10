/**
 * Utility function to format currency amounts according to currency code and locale.
 */
export function formatCurrency(amount, currencyCode = 'VND', locale = 'vi') {
  const numericAmount = Number(amount) || 0

  const currencySymbolMap = {
    VND: 'VND',
    THB: '฿',
    USD: '$',
    LAK: '₭'
  }

  const localeMap = {
    vi: 'vi-VN',
    th: 'th-TH',
    lo: 'lo-LA',
    en: 'en-US'
  }

  const formattedNum = numericAmount.toLocaleString(localeMap[locale] || 'vi-VN')
  const symbol = currencySymbolMap[currencyCode] || currencyCode

  if (currencyCode === 'USD') {
    return `$${formattedNum}`
  }
  return `${formattedNum} ${symbol}`
}
