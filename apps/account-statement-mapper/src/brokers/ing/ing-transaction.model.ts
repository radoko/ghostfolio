// 27-07-2023 11:29:19;
// 839349508;
// KETY;
// Sprzeda?;
// 22;
// 695,00;
// 15?290,00;
// 45.87;
// 15?244,13
export interface INGActivity {
  [key: string]: any;
  date: string
  something: string
  ticker: string
  type: "Kupno" | "Sprzeda?"
  quantity: number
  "pricePerShare": string
  "Total Amount": string
  amount: string
}
