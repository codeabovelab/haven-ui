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
  JobDetailed,
  SettingsPanel,
  EventsPanel,
  ContainerDetailed,
  UsersPanel,
  ClusterImages,
  ClusterNetworks,
  NetworkContainers,
  AgentPanel
} from 'containers';

export default (store) => {
  const requireLogin = (nextState, replace, cb) => {
    function checkNotAuth() {
      const { auth: { user }} = store.getState();
      if (!user) {
        // oops, not logged in, so can't be here!
        replace('/login');
      }
      cb();
    }

    checkNotAuth();
  };
  const redirectLogin = (nextState, replace, cb) => {
    let redirect = '/dashboard';
    if (window && window.location.search) {
      let search = window.location.search.match(/\?back=(.+)/);
      if (search && search[1]) {
        redirect = search[1];
      }
    }

    function checkAuth() {
      const { auth: { user }} = store.getState();
      if (user) {
        replace(redirect);
      }
      cb();
    }
    console.log('redirect: ', redirect);
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
        <Route name="Containers" path="clusters/:name" component={ClusterDetailsPanel}/>
        <Route name="Nodes" path="nodes" component={NodesPanel}/>
        <Route name="Nodes" path="clusters/:name/nodes" component={NodesPanel}/>
        <Route name="Images" path="images" component={ImagesPanel}/>
        <Route name="Registries" path="registries" component={RegistriesPanel}/>
        <Route name="Registries" path="clusters/:name/registries" component={RegistriesPanel}/>
        <Route name="Update" path="clusters/:name/images" component={ClusterImages}/>
        <Route name="Networks" path="clusters/:name/networks" component={ClusterNetworks}/>
        <Route name="Network Detailed" path="clusters/:name/networks/:subname" component={NetworkContainers}/>
        <Route name="Applications" path="clusters/:name/applications" component={ApplicationPanel}/>
        <Route name="Jobs" path="jobs" component={JobsPanel}/>
        <Route name="Settings" path="settings" component={SettingsPanel}/>
        <Route name="Events" path="clusters/:name/events" component={EventsPanel}/>
        <Route name="Container Detailed View" path="clusters/:name/containers/:subname" component={ContainerDetailed}/>
        <Route name="Job Detailed View" path="jobs/:name" component={JobDetailed}/>
        <Route name="Users" path="users" component={UsersPanel}/>
        <Route name="Agent" path="agent" component={AgentPanel}/>
      </Route>

      { /* Public Routes */ }
      <Route onEnter={redirectLogin}>
        <Route name="Login" path="login" component={Login}/>
      </Route>

      { /* Catch all route */ }
      <Route name="Not Found" path="*" component={NotFound} status={404}/>
    </Route>
  );
};
