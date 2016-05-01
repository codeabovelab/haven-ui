import React from 'react';
import {IndexRoute, Route} from 'react-router';
import {loadFromLS} from 'redux/modules/auth/auth';
import {
  App,
  Home,
  ClusterList,
  NodesList,
  ClusterDetail,
  Login,
  LoginSuccess,
  NotFound,
} from 'containers';

export default (store) => {
  const requireLogin = (nextState, replace, cb) => {
    function checkAuth() {
      const { auth: { user }} = store.getState();
      if (!user) {
        // oops, not logged in, so can't be here!
        replace('/login');
      }
      cb();
    }

    checkAuth();
    //if (!isAuthLoaded(store.getState())) {

    //  store.dispatch(loadAuth()).then(checkAuth);
    //} else {
    //}
  };

  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App}>
      <Route onEnter={requireLogin}>
        { /* Routes requiring login */ }
        { /* Home (main) route */ }
        <IndexRoute component={Home}/>

        <Route path="loginSuccess" component={LoginSuccess}/>
        <Route path="clusters" component={ClusterList}/>
        <Route path="clusters/:name" component={ClusterDetail}/>
        <Route path="nodes" component={NodesList}/>
      </Route>

      { /* Public Routes */ }
      <Route path="login" component={Login}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404}/>
    </Route>
  );
};
