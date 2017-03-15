import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as containerActions from 'redux/modules/containers/containers';
import * as networkActions from 'redux/modules/networks/networks';
import {connect} from 'react-redux';
import {NavContainer, DockTable, ActionMenu, LoadingDialog, Dialog} from '../../../components/index';
import {ContainerScale, ContainerUpdate} from '../../../containers/index';
import {Link} from 'react-router';
import {Button, ButtonToolbar, Badge, Panel, ProgressBar, Tabs, Tab} from 'react-bootstrap';
import _ from 'lodash';
import {browserHistory} from 'react-router';

function renderTdImage(row) {
  let name = row.image || '';
  let title = name ? name : '';
  let match = name.match(/[^/]+$/);
  name = match && match[0] ? match[0] : name;
  const MAX_LENGTH = 35;
  if (name) {
    if (name.length >= MAX_LENGTH) {
      name = '...' + name.substring(name.length - MAX_LENGTH, name.length);
    }
  }
  return (
    <td key="image">
      <span title={title}>{name}</span>
    </td>
  );
}

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
  networks: state.networks,
}), {
  loadContainers: clusterActions.loadContainers,
  loadClusters: clusterActions.load,
  listNetworks: networkActions.listNetworks,
})
export default class NetworkContainers extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    containers: PropTypes.object,
    networks: PropTypes.object.isRequired,
    loadContainers: PropTypes.func.isRequired,
    loadClusters: PropTypes.func.isRequired,
    listNetworks: PropTypes.func.isRequired,
  };

  DETACHED_ACTIONS = [
    {
      key: "attach",
      title: "Attach",
      default: true
    }
  ];

  ATTACHED_ACTIONS = [
    {
      key: "detach",
      title: "Detach",
      default: true
    }
  ];

  COLUMNS = [
    {
      name: 'name',
      width: '15%'
    },
    {
      name: 'image',
      render: renderTdImage,
      width: '35%'
    },
    {
      name: 'status',
      width: '20%'
    }
  ];

  constructor() {
    super();
    this.state = {
      actionDialog: undefined
    };
  }

  componentDidMount() {
    const {loadContainers, listNetworks, networks, loadClusters, params: {name}} = this.props;

    loadClusters();
    loadContainers(name);
    listNetworks(name);

    $('.input-search').focus();
  }

  render() {
    const {containers, clusters, params: {name}} = this.props;
    const cluster = clusters[name];
    if (!cluster) {
      return (
        <div></div>
      );
    }
    const containersIds = cluster.containersList;
    const rows = containersIds == null ? null : containersIds.map(id => containers[id]);

    return (
      <div className="panel panel-default">
        {!rows && (
          <ProgressBar active now={100}/>
        ) || (
          <div>
              <DockTable columns={this.COLUMNS}
                         rows={rows}
                         key={name}
              />
          </div>
        )}
        {(this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }
}
