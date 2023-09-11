export interface LedgerTransaction {
  "Operation Date": string,
  "Currency Ticker": string,
  "Operation Type": "IN" | "OUT",
  "Operation Amount": string,
  "Operation Fees": string,
  "Operation Hash": string,
  "Account Name": string,
  "Account xpub": string,
  "Countervalue Ticker": string,
  "Countervalue at Operation Date": string,
  "Countervalue at CSV Export": string,
};
