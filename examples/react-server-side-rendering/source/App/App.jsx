import { Content } from '../Content';
import { withAPIModel } from '../modules/API';
import { useSaltModel } from '../modules/Salt';

export const App = withAPIModel(() => <Content />, {
  dependencies: () => [useSaltModel()],
});
