import React from 'react';
import {IndexRoute, Route} from 'react-router';
import {
  App,
  Dashboard,
  ClusterList,
  ClusterDetail,
  NodesList,
  ImagesList,
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
  };

  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App}>
      <Route onEnter={requireLogin}>
        { /* Routes requiring login */ }
        { /* Home (main) route */ }
        <IndexRoute component={Dashboard}/>

        <Route path="dashboard" component={Dashboard}/>
        <Route path="loginSuccess" component={LoginSuccess}/>
        <Route path="clusters" component={ClusterList}/>
        <Route path="clusters/:name" component={ClusterDetail}/>
        <Route path="nodes" component={NodesList}/>
        <Route path="images" component={ImagesList}/>
      </Route>

      { /* Public Routes */ }
      <Route path="login" component={Login}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404}/>
    </Route>
  );
};
