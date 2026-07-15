declare module 'sslcommerz-lts' {
  export default class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, live?: boolean)
    init(data: Record<string, unknown>): Promise<Record<string, unknown>>
    validate(data: { val_id: string }): Promise<Record<string, unknown>>
    transactionQueryByTransactionId(data: {
      tran_id: string
    }): Promise<Record<string, unknown>>
  }
}
