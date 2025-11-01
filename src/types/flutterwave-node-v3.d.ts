declare module 'flutterwave-node-v3' {
  class Flutterwave {
    constructor(publicKey: string, secretKey: string)
    PaymentLink: {
      create(data: any): Promise<any>
    }
  }
  export default Flutterwave
}

