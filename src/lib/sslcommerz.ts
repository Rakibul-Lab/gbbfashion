/**
 * SSLCommerz client — uses the official sandbox/live REST endpoints.
 * We call the API directly (URL-encoded) because sslcommerz-lts’s FormData +
 * node-fetch path often fails to send proper multipart headers under Next.js.
 */

export type SslInitPayload = {
  total_amount: number
  currency: string
  tran_id: string
  success_url: string
  fail_url: string
  cancel_url: string
  ipn_url?: string
  shipping_method: string
  num_of_item?: number
  product_name: string
  product_category: string
  product_profile: string
  cus_name: string
  cus_email: string
  cus_add1: string
  cus_add2?: string
  cus_city: string
  cus_state: string
  cus_postcode: string
  cus_country: string
  cus_phone: string
  ship_name: string
  ship_add1: string
  ship_city: string
  ship_state: string
  ship_postcode: string
  ship_country: string
  value_a?: string
  value_b?: string
  value_c?: string
  value_d?: string
}

export type SslInitResponse = {
  status?: string
  failedreason?: string
  sessionkey?: string
  GatewayPageURL?: string
  redirectGatewayURL?: string
}

/**
 * Use the GatewayPageURL returned by SSLCommerz init.
 * Sandbox testbox uses EasyCheckOut (gw.php?Q=PAY constructed URLs return HTTP 500).
 * Live merchants typically receive the classic hosted gw.php URL from the API itself.
 */
export function resolveHostedGatewayUrl(sslRes: SslInitResponse): string | undefined {
  const fromApi = (sslRes.GatewayPageURL || sslRes.redirectGatewayURL || '').trim()
  if (fromApi) return fromApi

  // Fallback only if API omitted GatewayPageURL but session exists (rare)
  const sessionKey = (sslRes.sessionkey || '').trim()
  if (!sessionKey) return undefined

  const { isLive } = getSslCommerzConfig()
  const host = isLive ? 'securepay.sslcommerz.com' : 'sandbox.sslcommerz.com'
  return `https://${host}/gwprocess/v4/gw.php?Q=PAY&SESSIONKEY=${encodeURIComponent(sessionKey)}`
}

export type SslValidateResponse = {
  status?: string
  tran_id?: string
  val_id?: string
  amount?: string
  store_amount?: string
  currency?: string
  bank_tran_id?: string
  card_type?: string
  card_no?: string
  card_issuer?: string
  card_brand?: string
  card_issuer_country?: string
  risk_level?: string
  risk_title?: string
  tran_date?: string
  error?: string
}

function readEnv(name: string, fallback = ''): string {
  return (process.env[name] || fallback).trim()
}

export function getSslCommerzConfig() {
  const storeId = readEnv('SSLCOMMERZ_STORE_ID', 'testbox')
  const storePassword = readEnv('SSLCOMMERZ_STORE_PASSWORD', 'qwerty')
  const isLive = readEnv('SSLCOMMERZ_IS_LIVE', 'false').toLowerCase() === 'true'
  const host = isLive ? 'securepay.sslcommerz.com' : 'sandbox.sslcommerz.com'

  return {
    storeId,
    storePassword,
    isLive,
    initUrl: `https://${host}/gwprocess/v4/api.php`,
    validateUrl: `https://${host}/validator/api/validationserverAPI.php`,
  }
}

export function getAppBaseUrl(requestUrl?: string): string {
  const fromEnv =
    readEnv('NEXT_PUBLIC_SITE_URL') ||
    readEnv('NEXTAUTH_URL') ||
    ''
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (requestUrl) {
    try {
      return new URL(requestUrl).origin
    } catch {
      /* ignore */
    }
  }

  return 'http://localhost:3000'
}

function toFormBody(data: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    params.append(key, String(value))
  }
  return params.toString()
}

async function postForm<T>(url: string, data: Record<string, string | number | undefined | null>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: toFormBody(data),
    cache: 'no-store',
  })

  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(
      `SSLCommerz returned non-JSON (${res.status}): ${text.slice(0, 200)}`
    )
  }
}

export async function initSslCommerzPayment(
  data: SslInitPayload
): Promise<SslInitResponse> {
  const { storeId, storePassword, initUrl } = getSslCommerzConfig()

  const payload = {
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: data.total_amount,
    currency: data.currency || 'BDT',
    tran_id: data.tran_id,
    success_url: data.success_url,
    fail_url: data.fail_url,
    cancel_url: data.cancel_url,
    ipn_url: data.ipn_url || '',
    shipping_method: data.shipping_method || 'Courier',
    num_of_item: data.num_of_item ?? 1,
    product_name: data.product_name,
    product_category: data.product_category || 'fashion',
    product_profile: data.product_profile || 'general',
    cus_name: data.cus_name,
    cus_email: data.cus_email,
    cus_add1: data.cus_add1,
    cus_add2: data.cus_add2 || data.cus_city,
    cus_city: data.cus_city,
    cus_state: data.cus_state,
    cus_postcode: data.cus_postcode,
    cus_country: data.cus_country || 'Bangladesh',
    cus_phone: data.cus_phone.replace(/\D/g, '') || data.cus_phone,
    ship_name: data.ship_name,
    ship_add1: data.ship_add1,
    ship_city: data.ship_city,
    ship_state: data.ship_state,
    ship_postcode: data.ship_postcode,
    ship_country: data.ship_country || 'Bangladesh',
    value_a: data.value_a,
    value_b: data.value_b,
    value_c: data.value_c,
    value_d: data.value_d,
  }

  return postForm<SslInitResponse>(initUrl, payload)
}

export async function validateSslCommerzPayment(
  valId: string
): Promise<SslValidateResponse> {
  const { storeId, storePassword, validateUrl } = getSslCommerzConfig()
  const url =
    `${validateUrl}?val_id=${encodeURIComponent(valId)}` +
    `&store_id=${encodeURIComponent(storeId)}` +
    `&store_passwd=${encodeURIComponent(storePassword)}` +
    `&v=1&format=json`

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const text = await res.text()
  try {
    return JSON.parse(text) as SslValidateResponse
  } catch {
    throw new Error(
      `SSLCommerz validate returned non-JSON (${res.status}): ${text.slice(0, 200)}`
    )
  }
}

export function amountsMatch(
  gatewayAmount: string | number | undefined,
  orderAmount: number
): boolean {
  const a = Number(gatewayAmount)
  if (!Number.isFinite(a) || !Number.isFinite(orderAmount)) return false
  return Math.abs(a - orderAmount) < 0.5
}

export function buildProductName(
  items: Array<{ productName: string; quantity: number }>
): string {
  const joined = items
    .map((i) => `${i.productName}${i.quantity > 1 ? ` x${i.quantity}` : ''}`)
    .join(', ')
  const trimmed = joined.trim() || 'GBB Fashion Order'
  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed
}
