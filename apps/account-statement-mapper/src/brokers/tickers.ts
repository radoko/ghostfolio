import { INGActivity } from "./ing/ing-transaction.model";

export const TICKERS: Map<string, string> = new Map([
  ["LIVECHAT", "LVC.WA"],
  ["ASSECOPOL", "ACP.WA"],
  ["ATENDE", "ATD.WA"],
  ["APATOR", "APT.WA"],
  ["TOYA", "TOA.WA"],
  ["IZOSTAL", "IZS.WA"],
  ["KETY", "KTY.WA"],
  ["BOGDANKA", "LWB.WA"],
  ["INSTALKRK", "INK.WA"],
  ["ATAL", "1AT.WA"],
  ["ALUMETAL", "AML.WA"],
  ["PCCROKITA", "PCR.WA"],
  ["AMICA", "AMC.WA"],
  ["RAINBOW", "RBW.WA"],
  ["FAMUR", "GEA.WA"],
  ["HANDLOWY", "BHW.WA"],
  ["STALPROFI", "STF.WA"],
  ["DEBICA", "DBC.WA"],
  ["WAWEL", "WWL.WA"],
  ["ASSECOBS", "ABS.WA"],
  ["DROZAPOL", "DPL.WA"],
  ["TAURONPE", "TPE.WA"],
  ["ALIOR", "ALR.WA"],
  ["SANPL", "SPL.WA"],
  ["PEKAO", "PEO.WA"],
  ["CDPROJEKT", "CDR.WA"],
  ["ALLEGRO", "ALE.WA"],
  ["MIRBUD", "MRB.WA"],
  ["3M CO", "MMM"],
  ["MOBRUK", "MBR.WA"],
  ["VFEA LN ETF", "VFEA.L"],
  ["APPLE INC", "AAPL"],
]);

export function getTicker(activity: {ticker: string}) {
  return TICKERS.get(activity.ticker) || activity.ticker!.substring(0, 3) + ".WA";
}
