import { Product } from '~app-toolkit/helpers/presentation/balance-fetcher-response.present';
import { MetadataItem } from '~position/display.interface';
import { AppTokenPositionBalance, ContractPositionBalance } from '~position/position-balance.interface';

export type ProductItem = {
  label: string;
  assets: (AppTokenPositionBalance | ContractPositionBalance)[];
  meta: MetadataItemWithLabel[];
};

export type MetadataItemWithLabel = MetadataItem & { label: string };

export interface TokenBalanceResponse {
  products: ProductItem[];
  meta: MetadataItemWithLabel[];
  error?: string;
}

export interface BalanceFetcher {
  getBalances(address: string): Promise<{ products: Product[] }>;
}
