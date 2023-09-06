import { DataSource } from '@prisma/client';

export interface CreateAccountDto {
  accountType: string;
  balance: number;
  comment?: string;
  currency: string;
  id?: string;
  isExcluded?: boolean;
  name: string;
  platformId: string | null;
}


export interface CreateOrderDto {
  accountId?: string;
  comment?: string;
  currency: string;
  dataSource?: DataSource;
  date: string;
  fee: number;
  quantity: number;
  symbol: string;
  type: "BUY" | "SELL" | "DIVIDEND";
  unitPrice: number;
}

export interface ImportDataDto {
  accounts: CreateAccountDto[];
  activities: CreateOrderDto[];
}
