import fs from "fs";
import { LedgerTransaction } from "./ledger-transaction.model";
import { MapperService } from "../mapper.service";
import { CreateAccountDto, CreateOrderDto, ImportDataDto } from "../target.model";
import Papa from 'papaparse';
import * as yahooFinance from 'yahoo-finance';

export class LedgerMapper extends MapperService<LedgerTransaction> {

  static readonly INSTANCE = new LedgerMapper()

  map(transactions: LedgerTransaction[]): ImportDataDto {
    const account: CreateAccountDto = {
      "accountType": "SECURITIES",
      "balance": 0,
      "currency": "USD",
      "id": "3b2ec89f-84ee-43c2-936e-bd16b615bf22",
      "isExcluded": false,
      "name": "Etoro",
      "platformId": null
    }

    // 2022-03-04T09:33:15.000Z,BTC,IN,0.00200625,0.00027813,46da435f085385456a04a712fd18966c60bf7c8d7f0b4cac65e81691e7c26713,Bitcoin 1,xpub6DRezxWJ9tXmSBh2R67vRiUpfvuUWtAfE315vrdscRxxggX1tBgJxsf919J48pugcrJGzjt9a2yV6MLiCAKfbYdqh49GcVVx42yArYXcorJ,USD,85.24,51.54
    const activities: CreateOrderDto[] = transactions
      .filter(value => ["IN", "OUT"].includes(value["Operation Type"]))
      .filter(value => ["BTC", "DOT", "ETH"].includes(value["Currency Ticker"]))
      .map(activity => {
        const pastCurrencyPrice = this.getPastCurrencyPrice(activity["Currency Ticker"], activity["Operation Date"]);
        return {
          accountId: account.id,
          currency: activity["Countervalue Ticker"],
          dataSource: "YAHOO",
          date: activity["Operation Date"],
          fee: 0,
          quantity: +activity["Operation Amount"] - +activity["Operation Fees"],
          symbol: `${activity["Currency Ticker"]}-${activity["Countervalue Ticker"]}`,
          type: activity["Operation Type"] === "IN" ? "BUY" : "SELL",
          unitPrice: +pastCurrencyPrice
        }
      })

    return {
      accounts: [account],
      activities: activities
    };
  }

  async getPastCurrencyPrice(currency: string, date: string): Promise<number> {
    return new Promise(async (resolve, reject) => {
      yahooFinance.quote({
        symbol: currency,
        modules: ['price']
      }, (err: any, quotes: any) => {
        if (err) {
          console.error('Error fetching data:', err);
          reject();
          return;
        }
        resolve(quotes.price.regularMarketPrice);
        console.log(`BTC price: $${quotes.price.regularMarketPrice}`);
      });
    })
  }

  writeResult(result: ImportDataDto) {
    fs.writeFile('dist/ledger.json', JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error('Error writing target.json', err);
        return [];
      }

      console.log('Mapping successful! Data saved to target.json');
    });
  }

  readFile(fileName: string): Promise<LedgerTransaction[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        Papa.parse<LedgerTransaction>(data, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (result.errors.length > 0) {
              reject(new Error(JSON.stringify(result.errors))); // Convert the error array to a string for better clarity
              return;
            }
            resolve(result.data);
          }
        });
      });
    });
  }

}
