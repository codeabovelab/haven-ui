import { combineReducers } from 'redux';
import multireducer from 'multireducer';
import { routeReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import auth from './auth/auth';
import {reducer as form} from 'redux-form';
import menuLeft from './menuLeft';
import clusters from './clusters/clusters';
import clustersUI from './clusters/clustersUI';
import containers from './containers/containers';
import nodes from './nodes/nodes';
import nodesUI from './nodes/nodesUI';

export default combineReducers({
  routing: routeReducer,
  reduxAsyncConnect,
  auth,
  form,
  menuLeft,
  //BEGIN models data
  clusters,
  containers,
  nodes,
  //END models data
  clustersUI,
  nodesUI
});
