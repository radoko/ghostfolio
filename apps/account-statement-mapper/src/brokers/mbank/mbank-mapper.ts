import fs from "fs";
import { MbankActivity } from "./mbank-transaction.model";
import { MapperService } from "../mapper.service";
import { CreateAccountDto, CreateOrderDto, ImportDataDto } from "../target.model";
import Papa from 'papaparse';
import { getTicker } from "../tickers";
import moment from "moment-timezone";

export class MbankMapper extends MapperService<MbankActivity> {

  static readonly INSTANCE = new MbankMapper()

  map(transactions: MbankActivity[]): ImportDataDto {
    const account: CreateAccountDto = {
      "accountType": "SECURITIES",
      "balance": 0,
      "currency": "PLN",
      "id": "3b2ec89f-84ee-43c2-936e-bd16b615bf30",
      "isExcluded": false,
      "name": "mBank IKE",
      "platformId": null
    }
    console.log(transactions.length)
    console.log(transactions)
    const activities: CreateOrderDto[] = transactions
      // .filter(activity => ["BUY - MARKET", "SELL - MARKET", "DIVIDEND"].includes(activity.Type))
      // .filter(activity => ["MMM", "C", "INTC", "QCOM", "VZ",
      //   "META", "T", "RGR", "ASML", "AMZN", "NFLX", "TSLA", "COIN"
      // ].includes(activity.Ticker))
      .map(activity => {
        return {
          accountId: account.id,
          currency: activity.currency,
          dataSource: "YAHOO",
          date: moment(activity.date, 'DD.MM.YYYY HH:mm:ss').tz('Europe/Warsaw').toISOString(),
          fee: this.toNumber(activity.fee),
          quantity: activity.quantity,
          symbol: getTicker(activity),
          type: this.mapType(activity.type),
          unitPrice: this.toNumber(activity.pricePerShare)
        }
      })

    return {
      accounts: [account],
      activities: activities
    };
  }

  writeResult(result: ImportDataDto, targetFileName?: string) {
    fs.writeFile('dist/' + targetFileName || 'target-mbank.json', JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error('Error writing target.json', err);
        return [];
      }

      console.log('Mapping successful! Data saved to target.json');
    });
  }

  readFile(fileName: string): Promise<MbankActivity[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        let lineCounter = 0;
        const dataToProcess: MbankActivity[] = [];
        Papa.parse<MbankActivity>(data, {
          skipEmptyLines: true,
          delimiter: ';',
          dynamicTyping: true,
          step: function (row) {
            lineCounter++;
            if (lineCounter <= 27) return; // Skip the first 27 nonempty lines
            dataToProcess.push(row.data);  // Process or store the row's data as needed
          },
          complete: (result) => {
            if (result.errors.length > 0) {
              reject(new Error(JSON.stringify(result.errors))); // Convert the error array to a string for better clarity
              return;
            }
            // Czas transakcji;Walor;Gie�da;K/S;Liczba;Kurs;Waluta;Prowizja;Waluta;Warto��;Waluta
            // 12.07.2023 11:52:48;WAWEL;WWA-GPW;S;8;606,00;PLN;18,91;PLN;4 848,00;PLN
            // 11.07.2023 16:12:39;3M CO;USA-NYSE;K;1;100,2899;USD;14,00;PLN;406,54;PLN
            const columnMapping = [
              'date',
              'ticker',
              'source',
              'type',
              'quantity',
              'pricePerShare',
              "currency",
              'fee',
              'currencyFee',
              'totalAmount',
              'currencyTotalAmount',
            ];

            const transformedData = dataToProcess.map(row => {
              let obj: Partial<MbankActivity> = {};
              for (let i = 0; i < columnMapping.length; i++) {
                obj[columnMapping[i]] = row[i];
              }
              return obj;
            });

            resolve(transformedData as MbankActivity[]);
          }
        });
      });
    });
  }


  private mapType(Type: 'K' | 'S') {
    switch (Type) {
      case "K":
        return "BUY"
      case "S":
        return "SELL"
    }
  }

  private trimToNumber(fee: number) {
    return +fee;
  }

  private toNumber(fee: string) {
    //606,00
    return +fee.replace('.', '').replace(' ', '').replace(',', '.');
  }
}
