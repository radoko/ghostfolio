import { RevolutMapper } from "./brokers/revolut/revolut-mapper";
import { IngMapper } from "./brokers/ing/ing-mapper";

RevolutMapper.INSTANCE.exec('./statements/trading-account-statement_2018-03-01_2023-09-03_en_f77e11.csv')
IngMapper.INSTANCE.exec('./statements/historiaTransakcji_2023-09-04 19_20_40.csv')
