/** Storefront & admin currency catalog */

export type CurrencyOption = {
  code: string
  name: string
  symbol: string
  /** Symbol appears before the amount (most currencies) */
  symbolFirst?: boolean
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', symbolFirst: false },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', symbolFirst: false },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', symbolFirst: false },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', symbolFirst: false },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', symbolFirst: false },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
]

export const DEFAULT_CURRENCY_CODE = 'BDT'

export function getCurrency(code?: string | null): CurrencyOption {
  const found = CURRENCIES.find(
    (c) => c.code === (code || '').toUpperCase()
  )
  return found || CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY_CODE)!
}

export function formatMoney(
  amount: number,
  currencyOrCode?: CurrencyOption | string | null
): string {
  const currency =
    typeof currencyOrCode === 'object' && currencyOrCode
      ? currencyOrCode
      : getCurrency(typeof currencyOrCode === 'string' ? currencyOrCode : null)

  const formatted = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  if (currency.symbolFirst === false) {
    return `${formatted}${currency.symbol}`
  }
  return `${currency.symbol}${formatted}`
}

export function currencyLabel(currency: CurrencyOption): string {
  return `${currency.symbol} — ${currency.name} (${currency.code})`
}
