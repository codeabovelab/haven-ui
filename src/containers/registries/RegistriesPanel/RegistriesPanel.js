import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {load as loadRegistries, refreshRegistry, removeRegistry} from 'redux/modules/registries/registries';
import {loadClusterRegistries} from 'redux/modules/clusters/clusters';
import {update, load} from 'redux/modules/clusters/clusters';
import {DockTable, RegistriesList, StatisticsPanel, ClusterRegistriesDialog} from '../../../components/index';
import {RegistryEditForms} from '../../index';
import _ from 'lodash';
import { Link } from 'react-router';

@connect(
  state => ({
    registries: state.registries,
    registriesUI: state.registriesUI,
    clusters: state.clusters
  }), {loadRegistries, removeRegistry, loadClusterRegistries, update, load, refreshRegistry})

export default class RegistriesPanel extends Component {
  static propTypes = {
    registries: PropTypes.any.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    removeRegistry: PropTypes.func.isRequired,
    params: PropTypes.object,
    loadClusterRegistries: PropTypes.func.isRequired,
    clusters: PropTypes.object,
    load: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    refreshRegistry: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Registry Connected',
      titles: 'Registries Connected'
    }
  ];

  componentDidMount() {
    const {load, loadRegistries, params: {name}, loadClusterRegistries} = this.props;
    this.state = {};
    loadRegistries();
    if (name) {
      load().then(()=>loadClusterRegistries(name));
    }

    $('.input-search').focus();
  }

  render() {
    const {registries, params: {name}, clusters} = this.props;
    //hack to prevent rewriting redux store.events with wrong data (className and etc) on displaying of ClusterRegistriesDialog
    let rows = _.map(registries, (el)=>{
      el.name = el.name === 'Docker Hub' ? '' : el.name;
      return el;
    });
    if (name) {
      if (clusters[name]) {
        let clusterRegistries = _.get(clusters[name], 'config.registries', []);
        rows = rows.filter((el)=>(clusterRegistries.indexOf(el.name) > -1));
      } else {
        rows = [];
      }
    }

    let connectedRegistries = rows.length;

    return (
      <div>
        {name && (
          <ul className="breadcrumb">
            <li><Link to="/clusters">Clusters</Link></li>
            <li><Link to={"/clusters/" + name}>{name}</Link></li>
            <li className="active">Registries</li>
          </ul>
        ) || (
          <ul className="breadcrumb">
            <li className="active">Registries</li>
          </ul>
        )}

        <StatisticsPanel metrics={this.statisticsMetrics} values={[connectedRegistries]}/>

        <RegistriesList loading={typeof RegistriesList === "undefined"}
                        data={rows}
                        name={name}
                        manageRegistries={this.onActionInvoke.bind(this, "manageRegistries")}
                        onNewEntry={this.onActionInvoke.bind(this, "create")}
                        onActionInvoke={this.onActionInvoke.bind(this)}
        />

        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  onActionInvoke(action, registryId, event) {
    let registry;
    const {params: {name}, registries} = this.props;

    if (registryId) {
      registry = _.find(registries, (o) => o.name === registryId);
    }

    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <RegistryEditForms title="Connect to New Registry"
                          registry={undefined}
                          onHide={this.onHideDialog.bind(this)}
                          okTitle="Create Registry"
            />
          )
        });
        return;

      case "edit":
        this.setState({
          actionDialog: (
            <RegistryEditForms title="Edit Registry"
                          registry={registry}
                          onHide={this.onHideDialog.bind(this)}
                          okTitle="Update Registry"
            />
          )
        });
        return;

      case "delete":
        this.setState({
          actionDialog: undefined
        });

        confirm('Are you sure you want to remove this registry?')
          .then(() => {
            this.props.removeRegistry(registryId).catch(() => null)
              .then(() => this.props.loadRegistries());
          })
          .catch(() => null);

        return;

      case "deleteFromCluster":
        this.setState({
          actionDialog: undefined
        });
        let registryName = registryId === '' ? 'Docker Hub' : registryId;
        confirm('Are you sure you want to remove registry "' + registryName + '" from cluster "' + name + '"?')
          .then(() => {
            this.changeClusterRegistries(name, registryId).catch(() => null);
          })
          .catch(() => null);
        return;

      case "manageRegistries":
        this.setState({
          actionDialog: (
            <ClusterRegistriesDialog title="Manage Cluster Registries"
                                     clusterName={this.props.params.name}
                                     ownRegistries={this.props.clusters[name].config.registries}
                                     onHide={this.onHideDialog.bind(this)}
                                     availableRegistries={registries}
                                     clusters={this.props.clusters}
                                     update={this.props.update}
                                     loadRegistries={this.props.loadRegistries}
                                     loadClusterRegistries={this.props.loadClusterRegistries}
            />
          )
        });
        return;

      case "refresh":
        this.props.refreshRegistry(registryId).catch(() => null);
        return;

      default:
        return;
    }
  }

  changeClusterRegistries(name, registryId) {
    const {update, clusters, loadClusterRegistries} = this.props;
    if (clusters[name]) {
      let registries = _.without(clusters[name].config.registries, registryId);
      update(name, {"config": {"registries": registries}})
        .then(() => loadClusterRegistries(name));
    }
  }
}


