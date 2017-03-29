import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as networkActions from 'redux/modules/networks/networks';
import {connect} from 'react-redux';
import {DockTable, ActionMenu, LoadingDialog, StatisticsPanel} from '../../../components/index';
import {Panel, ProgressBar} from 'react-bootstrap';
import _ from 'lodash';
import Helmet from 'react-helmet';

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
  connectNetwork: networkActions.connectNetwork,
  disconnectNetwork: networkActions.disconnectNetwork,
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
    connectNetwork: PropTypes.func.isRequired,
    disconnectNetwork: PropTypes.func.isRequired,
  };

  DETACHED_ACTIONS = [
    {
      key: "connect",
      title: "Connect",
      default: true
    }
  ];

  ATTACHED_ACTIONS = [
    {
      key: "disconnect",
      title: "Disconnect",
      default: true
    }
  ];

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Container',
      titles: 'Containers'
    }
  ];

  COLUMNS = [
    {
      name: 'name',
      width: '15%',
      sortable: true
    },
    {
      name: 'image',
      render: renderTdImage,
      width: '35%',
      sortable: true
    },
    {
      name: 'status',
      width: '20%',
      sortable: true
    },
    {
      name: 'connection',
      width: '10%',
      sortable: true
    },
    {
      name: 'Actions',
      width: '1%',
      render: this.actionsRender.bind(this)
    }
  ];

  constructor() {
    super();
    this.state = {
      actionDialog: undefined,
      currentNetwork: {}
    };
  }

  componentWillMount() {
    const {loadContainers, listNetworks, loadClusters, params: {name}, params: {subname}} = this.props;
    loadClusters();
    loadContainers(name);
    listNetworks(name).then(()=> {
      this.setState({
        currentNetwork: _.find(this.props.networks.list, {id: subname})
      });
    });
  }

  componentDidMount() {
    $('.input-search').focus();
  }

  actionsRender(row) {
    return (
      <td key="actions" className="td-actions">
        <ActionMenu subject={row}
                    actions={row.connection === 'Connected' ? this.ATTACHED_ACTIONS : this.DETACHED_ACTIONS}
                    actionHandler={this.onActionInvoke.bind(this)}
        />
      </td>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  onActionInvoke(action, row) {
    const {params: {name}} = this.props;
    switch (action) {
      case "connect":
        confirm(`Are you sure you want to connect container "${row.name}" to network "${row.network.name}" ?`)
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog network={row.network}
                               container={row}
                               entityType="network"
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.connectNetwork}
                               refreshData={this.props.listNetworks}
                               actionKey={`connected to container "${row.name}"`}
                />
              )
            });
          }).catch(()=>null);
        return;
      case "disconnect":
        confirm(`Are you sure you want to disconnect container "${row.name}" from network "${row.network.name}" ?`)
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog network={row.network}
                               container={row}
                               entityType="network"
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.disconnectNetwork}
                               refreshData={this.props.listNetworks}
                               actionKey={`disconnected from container "${row.name}"`}
                />
              )
            });
          }).catch(()=>null);
        return;

      default:
        return;
    }
  }

  render() {
    const {containers, clusters, params: {name}} = this.props;
    const cluster = clusters[name];
    const network = this.state.currentNetwork;
    const panelHeader = (
      <div className="clearfix">
        <h3>{`network "${_.get(this.state.currentNetwork, 'name', "")}" containers relations`}</h3>
      </div>
    );
    if (!cluster) {
      return (
        <div></div>
      );
    }
    const containersIds = cluster.containersList;
    const rows = containersIds == null ? null : containersIds.map(id => {
      const connectionStatus = _.find(network.containers, {id: id}) ? "Connected" : "Disconnected";
      return _.merge(containers[id], {connection: connectionStatus, network: network});
    });

    return (
      <div key={name}>
        <Helmet title="Network Containers"/>
        {rows && (
          <StatisticsPanel metrics={this.statisticsMetrics}
                           values={[rows.length]}
          />
        )}
        <Panel header={panelHeader}>
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
        </Panel>
      </div>
    );
  }
}
