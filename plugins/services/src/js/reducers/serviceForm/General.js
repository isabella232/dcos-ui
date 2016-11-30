import {simpleReducer, simpleIntReducer} from '../../../../../../src/js/utils/ReducerUtil';
import {FormReducer as constraints} from './Constraints';

module.exports = {
  constraints,
  id: simpleReducer('id'),
  instances: simpleReducer('instances'),
  // Container runtime is handled in ./serviceForm/Container
  cpus: simpleReducer('cpus'),
  mem: simpleReducer('mem'),
  disk: simpleReducer('disk'),
  gpus: simpleIntReducer('gpus'),
  cmd: simpleReducer('cmd')
};
