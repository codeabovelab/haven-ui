import { combineReducers } from 'redux';
import multireducer from 'multireducer';
import { routeReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import auth from './auth';
import {reducer as form} from 'redux-form';
import menuLeft from './menuLeft';
import clusters from './clusters/clusters';
import clustersUI from './clusters/clustersUI';
import clusterDetail from './clusterDetail';
import nodes from './nodes';

export default combineReducers({
  routing: routeReducer,
  reduxAsyncConnect,
  auth,
  form,
  menuLeft,
  clusters,
  clustersUI,
  clusterDetail,
  nodes
});
