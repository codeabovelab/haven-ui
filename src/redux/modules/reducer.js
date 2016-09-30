import { combineReducers } from 'redux';
import multireducer from 'multireducer';
import { routerReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import auth from './auth/auth';
import {reducer as form} from 'redux-form';
import menuLeft from './menuLeft/menuLeft';
import clusters from './clusters/clusters';
import clustersUI from './clusters/clustersUI';
import containers from './containers/containers';
import containersUI from './containers/containersUI';
import nodes from './nodes/nodes';
import nodesUI from './nodes/nodesUI';
import images from './images/images';
import imagesUI from './images/imagesUI';
import registries from './registries/registries';
import registriesUI from './registries/registriesUI';
import events from './events/events';
import application from './application/application';

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect,
  auth,
  form,
  menuLeft,
  //BEGIN models data
  clusters,
  containers,
  nodes,
  images,
  registries,
  events,
  //END models data
  application,
  imagesUI,
  registriesUI,
  clustersUI,
  containersUI,
  nodesUI
});
