import { ImportDataDto } from "./target.model";

export abstract class MapperService<T> {
  abstract readFile(fileName: string): Promise<T[]>;

  abstract map(transactions: T[]): ImportDataDto;

  abstract writeResult(result: ImportDataDto): void;

  async exec(fileName: string) {
    const fileResult = await this.readFile(fileName);
    const importDataDto = this.map(fileResult);
    this.writeResult(importDataDto);
  };
}
