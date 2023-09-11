import fs from "fs";
import { MapperService } from "../mapper.service";
import { CreateAccountDto, CreateOrderDto, ImportDataDto } from "../target.model";
import Papa from 'papaparse';
import moment from "moment-timezone";
import { EtoroActivity } from "./etoro-transaction.model";

export class EtoroMapper extends MapperService<EtoroActivity> {

  static readonly INSTANCE = new EtoroMapper()

  map(transactions: EtoroActivity[]): ImportDataDto {
    const account: CreateAccountDto = {
      "accountType": "SECURITIES",
      "balance": 0,
      "currency": "USD",
      "id": "3b2ec89f-84ee-43c2-936e-bd16b615bf22",
      "isExcluded": false,
      "name": "Etoro",
      "platformId": null
    }
    const activities: CreateOrderDto[] = transactions
      .map(activity => {
        return {
          accountId: account.id,
          currency: activity.Currency,
          dataSource: "YAHOO",
          date: moment(activity.Date, 'DD/MM/YYYY HH:mm').tz('Europe/Warsaw').toISOString(),
          fee: 0,
          quantity: +activity.Quantity,
          symbol: activity.Ticker,
          type: activity.Type,
          unitPrice: +activity["Price per share"]
        }
      })

    return {
      accounts: [account],
      activities: activities
    };
  }

  writeResult(result: ImportDataDto) {
    fs.writeFile('dist/etoro.json', JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error('Error writing target.json', err);
        return [];
      }

      console.log('Mapping successful! Data saved to target.json');
    });
  }

  readFile(fileName: string): Promise<EtoroActivity[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        Papa.parse<EtoroActivity>(data, {
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

  private mapType(Type: "BUY - MARKET" | "SELL - MARKET" | "DIVIDEND") {
    switch (Type) {
      case "BUY - MARKET":
        return "BUY"
      case "SELL - MARKET":
        return "SELL"
      case "DIVIDEND":
        return "DIVIDEND"
    }
  }

}
