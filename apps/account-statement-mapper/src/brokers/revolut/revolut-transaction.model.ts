export interface RevolutActivity {
  Date: string;
  Ticker: string;
  Type: "BUY - MARKET" | "SELL - MARKET" | "DIVIDEND"
  Quantity: number;
  'Price per share': string;
  'Total Amount': string;
  Currency: string;
  'FX Rate': number;
};
