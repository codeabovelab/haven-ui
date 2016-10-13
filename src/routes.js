import React from 'react';
import {IndexRoute, Route} from 'react-router';
import {
  App,
  Dashboard,
  ClustersPanel,
  ClusterDetailsPanel,
  NodesPanel,
  ImagesPanel,
  RegistriesPanel,
  Login,
  LoginSuccess,
  NotFound,
  ApplicationPanel,
  JobsPanel,
  SettingsPanel
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
        <Route name="Clusters" path="clusters" component={ClustersPanel}/>
        <Route name="" path="clusters/:name" component={ClusterDetailsPanel}/>
        <Route name="Containers" path="clusters/all" component={ClusterDetailsPanel} />
        <Route name="Nodes" path="nodes" component={NodesPanel}/>
        <Route name="Nodes" path="clusters/:name/nodes" component={NodesPanel}/>
        <Route name="Images" path="images" component={ImagesPanel}/>
        <Route name="Registries" path="registries" component={RegistriesPanel}/>
        <Route name="Applications" path="clusters/:name/applications" component={ApplicationPanel}/>
        <Route name="Jobs" path="jobs" component={JobsPanel}/>
        <Route name="Settings" path="settings" component={SettingsPanel}/>
      </Route>

      { /* Public Routes */ }
      <Route name="Login" path="login" component={Login}/>

      { /* Catch all route */ }
      <Route name="Not Found" path="*" component={NotFound} status={404}/>
    </Route>
  );
};
