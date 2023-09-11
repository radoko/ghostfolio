import { RevolutMapper } from "./brokers/revolut/revolut-mapper";
import { IngMapper } from "./brokers/ing/ing-mapper";
import { MbankMapper } from "./brokers/mbank/mbank-mapper";
import { EtoroMapper } from "./brokers/etoro/etoro-mapper";
import { LedgerMapper } from "./brokers/ledger/ledger-mapper";

//
// EtoroMapper.INSTANCE.exec('./statements/etoro.csv')
// RevolutMapper.INSTANCE.exec('./statements/revolut-crypto.csv')
// IngMapper.INSTANCE.exec('./statements/historiaTransakcji_2023-09-04 19_20_40.csv')
// MbankMapper.INSTANCE.exec('./statements/eMAKLER_historia_transakcji_ike.Csv', 'ike.json')
// MbankMapper.INSTANCE.exec('./statements/eMAKLER_historia_transakcji_ikze.Csv', 'ikze.json')
LedgerMapper.INSTANCE.exec('./statements/ledgerlive-operations-2023.09.07.csv')
