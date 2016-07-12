import React from 'react';
import {IndexRoute, Route} from 'react-router';
import {
  App,
  Dashboard,
  ClusterList,
  ClusterDetail,
  NodesList,
  ImagesList,
  RegistriesList,
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
    <Route name="Home" path="/" component={App}>
      <Route onEnter={requireLogin}>
        { /* Routes requiring login */ }
        { /* Home (main) route */ }
        <IndexRoute name="Dashboard" component={Dashboard}/>

        <Route name="Dashboard" path="dashboard" component={Dashboard}/>
        <Route name="Login Successful" path="loginSuccess" component={LoginSuccess}/>
        <Route name="Clusters" path="clusters" component={ClusterList}/>
        <Route name="Cluster Details" path="clusters/:name" component={ClusterDetail}/>
        <Route name="Nodes List" path="nodes" component={NodesList}/>
        <Route name="Images List" path="images" component={ImagesList}/>
        <Route name="Registries" path="registries" component={RegistriesList}/>
      </Route>

      { /* Public Routes */ }
      <Route name="Login" path="login" component={Login}/>

      { /* Catch all route */ }
      <Route name="Not Found" path="*" component={NotFound} status={404}/>
    </Route>
  );
};
