export interface MbankActivity {
  [key: string]: any;
  date : string,
  ticker: string,
  source: 'WWA-GPW' | 'USA-NYSE',
  type: 'K' | 'S',
  quantity: number,
  pricePerShare: string,
  currency: string,
  fee: string,
  currencyFee: string,
  totalAmount: string,
  currencyTotalAmount: string,
};

