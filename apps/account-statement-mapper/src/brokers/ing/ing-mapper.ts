import fs from "fs";
import Papa, { ParseResult } from 'papaparse';
import { INGActivity } from "./ing-transaction.model";
import { MapperService } from "../mapper.service";
import { CreateAccountDto, CreateOrderDto, ImportDataDto } from "../target.model";
import moment from 'moment-timezone';

export class IngMapper extends MapperService<INGActivity> {

  static readonly INSTANCE = new IngMapper()
  static readonly NO_LONGER_LISTED = ["ZYWIEC", 'LOTOS', 'KRUSZWICA', 'PGNIG'];
  static readonly TICKERS: Map<string, string> = new Map([
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
    ["ALLEGRO", "ALG.WA"],
    ["MIRBUD", "MRB.WA"],
  ]);

  map(transactions: INGActivity[]): ImportDataDto {
    const account: CreateAccountDto = {
      "accountType": "SECURITIES",
      "balance": 0,
      "currency": "PLN",
      "id": "3b2ec89f-84ee-43c2-936e-bd16b615bf31",
      "isExcluded": false,
      "name": "ING",
      "platformId": null
    }

    const activities: CreateOrderDto[] = transactions
      .filter(activity => !IngMapper.NO_LONGER_LISTED.includes(activity.ticker))
      .filter(activity => [
        'PZU', 'JSW', 'CIGAMES', 'KGHM', 'CDPROJEKT', 'CCC',
        'GPW', 'PEKAO', 'PKNORLEN', 'PGE',

        'ALIOR',
        'PGNIG',
        'SANPL', 'BOWIM',

        'DROZAPOL', 'TAURONPE', 'PKPCARGO', 'PKOBP',
        'STALPROFI', 'DEBICA', 'WAWEL', 'ASSECOBS',
        'RAINBOW', 'COGNOR', 'FAMUR', 'HANDLOWY',
        'DOMDEV', 'ATAL', 'ALUMETAL', 'PCCROKITA',
        'ODLEWNIE', 'KRUSZWICA', 'BOGDANKA', 'INSTALKRK',
        'IZOSTAL', 'KETY', 'OEX', 'ALLEGRO',
        'APATOR', 'TOYA', 'KERNEL', 'AMICA',
        'ATENDE', 'MIRBUD', 'ASBIS', 'ASTARTA',
        'AMBRA', 'LIVECHAT', 'ASSECOPOL'
      ].includes(activity.ticker))
      // .filter(activity => ["MMM", "C", "INTC", "QCOM", "VZ",
      //   "META", "T", "RGR", "ASML", "AMZN", "NFLX", "TSLA", "COIN"
      // ].includes(activity.Ticker))
      .map(activity => {
        return {
          accountId: account.id,
          currency: "PLN",
          // dataSource: "YAHOO",
          date: moment(activity.date, 'DD-MM-YYYY HH:mm:ss').tz('Europe/Warsaw').toISOString(),
          fee: 0,
          quantity: activity.quantity as number,
          symbol: this.getTicker(activity),
          type: this.mapIngType(activity.type as "Kupno" | "Sprzeda?"),
          unitPrice: this.getIngUnitPrice(activity.pricePerShare as string)
        }
      })
//
    return {
      accounts: [account],
      activities: activities
    };
  }

  private getTicker(activity: INGActivity) {
    return IngMapper.TICKERS.get(activity.ticker) || activity.ticker!.substring(0, 3) + ".WA";
  }

  writeResult(result: ImportDataDto) {
    fs.writeFile('dist/ing-target.json', JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error('Error writing target.json', err);
        return [];
      }

      console.log('Mapping successful! Data saved to target.json');
    });
  }

  readFile(fileName: string): Promise<INGActivity[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading source.json', err);
          reject(err);
        } else {
          const sourceData: ParseResult<INGActivity> = Papa.parse<INGActivity>(data, {
            dynamicTyping: true,
            skipEmptyLines: true,
            delimiter: ';'
          });

          const columnMapping = [
            'date',
            'something',
            'ticker',
            'type',
            'quantity',
            "pricePerShare",
            "Total Amount",
            'amount'];

          const transformedData = sourceData.data.map(row => {
            let obj: Partial<INGActivity> = {};
            for (let i = 0; i < columnMapping.length; i++) {
              obj[columnMapping[i]] = row[i];
            }
            return obj;
          });

          resolve(transformedData as INGActivity[]);
        }
      });
    });
  }

  mapIngType(Type: "Kupno" | "Sprzeda?") {
    return Type === "Kupno" ? "BUY" : "SELL";
  }

  getIngUnitPrice(activityElement: string): number {
    return +activityElement.replace('.', '').replace(',', '.');
  }
}
