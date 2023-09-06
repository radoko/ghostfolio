import fs from "fs";
import { RevolutActivity } from "./revolut-transaction.model";
import { MapperService } from "../mapper.service";
import { CreateAccountDto, CreateOrderDto, ImportDataDto } from "../target.model";
import Papa from 'papaparse';

export class RevolutMapper extends MapperService<RevolutActivity> {

  static readonly INSTANCE = new RevolutMapper()

  map(transactions: RevolutActivity[]): ImportDataDto {
    const account: CreateAccountDto = {
      "accountType": "SECURITIES",
      "balance": 0,
      "currency": "USD",
      "id": "3b2ec89f-84ee-43c2-936e-bd16b615bf32",
      "isExcluded": false,
      "name": "Revolut",
      "platformId": null
    }
    const activities: CreateOrderDto[] = transactions
      .filter(activity => ["BUY - MARKET", "SELL - MARKET", "DIVIDEND"].includes(activity.Type))
      .filter(activity => ["MMM", "C", "INTC", "QCOM", "VZ",
        "META", "T", "RGR", "ASML", "AMZN", "NFLX", "TSLA", "COIN"
      ].includes(activity.Ticker))
      .map(activity => {
        return {
          accountId: account.id,
          currency: activity.Currency,
          dataSource: "YAHOO",
          date: activity.Date.toString(),
          fee: 0,
          quantity: this.getQuantity(activity),
          symbol: activity.Ticker,
          type: this.mapType(activity.Type),
          unitPrice: this.getUnitPrice(activity)
        }
      })

    return {
      accounts: [account],
      activities: activities
    };
  }

  writeResult(result: ImportDataDto) {
    fs.writeFile('dist/target-revolut.json', JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error('Error writing target.json', err);
        return [];
      }

      console.log('Mapping successful! Data saved to target.json');
    });
  }

  readFile(fileName: string): Promise<RevolutActivity[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        Papa.parse<RevolutActivity>(data, {
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

  private getUnitPrice(activity: RevolutActivity) {
    let result = ""
    if (activity.Type === "DIVIDEND") {
      result = activity["Total Amount"]
    } else {
      result = activity["Price per share"];
    }
    return +result.substring(1).replace(',', '');
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

  private getQuantity(activity: RevolutActivity) {
    if (activity.Type === "DIVIDEND") {
      return 1
    }
    return activity.Quantity;
  }
}
