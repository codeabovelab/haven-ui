import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {loadClusterRegistries} from 'redux/modules/clusters/clusters';
import {create, load} from 'redux/modules/clusters/clusters';
import {DockTable, RegistriesList, StatisticsPanel, ClusterRegistriesDialog} from '../../../components/index';
//import {RegistryEdit} from '../../index';
import {RegistryEditForms} from '../../index';
import _ from 'lodash';
import { Link } from 'react-router';
import {removeRegistry} from 'redux/modules/registries/registries';

@connect(
  state => ({
    registries: state.registries,
    registriesUI: state.registriesUI,
    clusters: state.clusters
  }), {loadRegistries, removeRegistry, loadClusterRegistries, create, load})

export default class RegistriesPanel extends Component {
  static propTypes = {
    registries: PropTypes.array.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    removeRegistry: PropTypes.func.isRequired,
    params: PropTypes.object,
    loadClusterRegistries: PropTypes.func.isRequired,
    clusters: PropTypes.object,
    load: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired
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
    const {loading, loadingError} = this.props.registriesUI;
    const {registries, registriesUI, params: {name}, clusters} = this.props;

    let rows = [...registries];
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

  additionalData(rows) {
    if (rows) {
      rows.forEach(row => {
        row.__attributes = {'data-name': row.name};
      //  row.actions = this.tdActions.bind(this);
      });
    }
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

        confirm('Are you sure you want to remove registry "' + registryId + '" from cluster "' + name + '"?')
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
                                     registries={this.props.registries}
                                     clusters={this.props.clusters}
                                     create={this.props.create}
                                     loadRegistries={this.props.loadRegistries}
                                     loadClusterRegistries={this.props.loadClusterRegistries}
            />
          )
        });
        return;

      default:
        return;
    }
  }

  changeClusterRegistries(name, registryId) {
    const {create, clusters, loadClusterRegistries} = this.props;
    if (clusters[name]) {
      let registries = _.without(clusters[name].config.registries, registryId);
      create(name, {"config": {"registries": registries}, "description": clusters[name].description})
        .then(() => loadClusterRegistries(name));
    }
  }
}


