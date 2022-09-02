import { Inject, Injectable } from '@nestjs/common';
import { formatUnits } from 'ethers/lib/utils';
import { uniq } from 'lodash';

import { Register } from '~app-toolkit/decorators';
import { ContractPositionBalance } from '~position/position-balance.interface';
import { PositionPresenterTemplate, ReadonlyBalances } from '~position/template/position-presenter.template';
import { Network } from '~types';

import { MorphoContractFactory } from '../contracts';
import MORPHO_DEFINITION from '../morpho.definition';

import { MorphoCompoundContractPositionDataProps } from './morpho.morpho-compound.contract-position-fetcher';

@Injectable()
export class EthereumMorphoPositionPresenter extends PositionPresenterTemplate {
  network = Network.ETHEREUM_MAINNET;
  appId = MORPHO_DEFINITION.id;

  lensAddress = '0x930f1b46e1d081ec1524efd95752be3ece51ef67';

  constructor(@Inject(MorphoContractFactory) protected readonly contractFactory: MorphoContractFactory) {
    super();
  }

  @Register.BalanceProductMeta('Morpho Compound')
  async getMorphoCompoundMeta(address: string, balances: ReadonlyBalances) {
    const markets = (balances as ContractPositionBalance<MorphoCompoundContractPositionDataProps>[]).map(
      v => v.dataProps.marketAddress,
    );
    const lens = this.contractFactory.morphoCompoundLens({ address: this.lensAddress, network: this.network });
    const { collateralValue, debtValue, maxDebtValue } = await lens.getUserBalanceStates(address, uniq(markets));

    const totalDebt = +formatUnits(debtValue);
    const maxDebt = +formatUnits(maxDebtValue);

    return [
      {
        label: 'Collateral',
        value: maxDebt,
        type: 'dollar',
      },
      {
        label: 'Total Supply',
        value: +formatUnits(collateralValue),
        type: 'dollar',
      },
      {
        label: 'Debt',
        value: totalDebt,
        type: 'dollar',
      },
      {
        label: 'Utilization Rate',
        value: maxDebt > 0 ? totalDebt / maxDebt : 0,
        type: 'pct',
      },
    ];
  }
}