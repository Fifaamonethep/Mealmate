/**
 * Dynamic QR Generator for LAOQR & VietQR with embedded amounts
 */

export function generateLaoQrUrl({ username, amount, note = 'MealMate Payment' }) {
  const cleanUser = (username || 'USER').toUpperCase()
  const cleanAmount = Math.round(Number(amount) || 0)
  const encodedNote = encodeURIComponent(note)
  const qrData = `LAOQR-PAY-${cleanUser}-${cleanAmount}LAK-${encodedNote}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
}

export function generateVietQrUrl({ username, amount, bank = 'MBBank' }) {
  const cleanUser = (username || 'USER').toUpperCase()
  const cleanAmount = Math.round(Number(amount) || 0)
  const qrData = `VIETQR-PAY-${bank}-${cleanUser}-${cleanAmount}VND`
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`
}
