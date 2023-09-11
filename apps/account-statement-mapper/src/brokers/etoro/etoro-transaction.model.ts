export interface EtoroActivity {
  Date: string;
  Ticker: string;
  Type: "BUY" | "SELL"
  Quantity: number;
  'Price per share': string;
  Currency: string;
};
