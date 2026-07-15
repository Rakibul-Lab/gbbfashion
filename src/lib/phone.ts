/**
 * Bangladesh mobile numbers:
 * - Local 11 digits: 01XXXXXXXXX
 * - With country code: +8801XXXXXXXXX / 8801XXXXXXXXX
 */
export function normalizeBdMobileDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function isValidBdMobile(phone: string): boolean {
  const digits = normalizeBdMobileDigits(phone)
  if (/^01\d{9}$/.test(digits)) return true
  if (/^8801\d{9}$/.test(digits)) return true
  return false
}

/** Prefer local 01… form for storage / SSL payload when possible */
export function toLocalBdMobile(phone: string): string {
  const digits = normalizeBdMobileDigits(phone)
  if (/^8801\d{9}$/.test(digits)) return `0${digits.slice(3)}`
  return digits
}
