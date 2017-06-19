import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {NavContainer, DockTable, ActionMenu, LoadingDialog, StatisticsPanel} from '../../../components/index';
import {Link, RouteHandler} from 'react-router';
import {getDeployedImages} from 'redux/modules/images/images';
import {updateContainers} from 'redux/modules/containers/containers';
import {ProgressBar} from 'react-bootstrap';
import _ from 'lodash';
import {listNetworks, deleteNetwork} from 'redux/modules/networks/networks';
import Helmet from 'react-helmet';

let clusterNetworksMounted = null;

@connect(
  state => ({
    networks: state.networks,
  }), {listNetworks, deleteNetwork})
export default class ClusterNetworks extends Component {
  static propTypes = {
    networks: PropTypes.object,
    params: PropTypes.object,
    listNetworks: PropTypes.func.isRequired,
    deleteNetwork: PropTypes.func.isRequired
  };

  COLUMNS = [
    {
      name: 'name',
      width: '10%',
      sortable: true,
      render: this.nameRender.bind(this),
    },
    {
      name: 'driver',
      width: '10%',
      sortable: true
    },
    {
      name: 'attachable',
      width: '5%',
      sortable: true,
      render: this.attachableRender,
    },
    {
      name: 'scope',
      width: '5%',
      sortable: true
    },
    {
      name: 'containers',
      width: '5%',
      sortable: true,
      render: this.containersRender
    },
    {
      name: 'gateway',
      width: '10%',
      sortable: true,
      render: this.gatewayRender
    },
    {
      name: 'subnet',
      width: '10%',
      sortable: true,
      render: this.subnetRender
    },
    {
      name: 'Actions',
      width: '1%',
      render: this.actionsRender.bind(this)
    }
  ];

  ACTIONS = [
    {
      key: "delete",
      title: "Delete"
    }];

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Network',
      titles: 'Networks'
    }
  ];

  constructor() {
    super();
    this.state = {
      actionDialog: undefined
    };
  }

  componentWillMount() {
    const {listNetworks, params: {name}} = this.props;
    listNetworks(name);
  }

  componentDidMount() {
    clusterNetworksMounted = true;
  }

  nameRender(row) {
    const {params: {name}} = this.props;
    const networkName = _.get(row, 'name', '');
    return (
      <td key="name">
        <Link to={`/clusters/${name}/networks/${row.id}`}>{networkName}</Link>
      </td>
    );
  }

  attachableRender(row) {
    const attachable = _.get(row, 'attachable', '').toString();
    return (
      <td key="attachable">
        <span>{attachable}</span>
      </td>
    );
  }

  gatewayRender(row) {
    const gateway = _.get(row, 'ipam.config.0.gateway', '');
    return (
      <td key="gateway">
        <span>{gateway}</span>
      </td>
    );
  }

  subnetRender(row) {
    const subnet = _.get(row, 'ipam.config.0.subnet', '');
    return (
      <td key="subnet">
        <span>{subnet}</span>
      </td>
    );
  }

  containersRender(row) {
    const containersNumber = _.get(row, 'containers', []).length;
    return (
      <td key="containers">
        <span>{containersNumber}</span>
      </td>
    );
  }

  actionsRender(row) {
    return (
      <td key="actions" className="td-actions">
        <ActionMenu subject={row}
                    actions={this.ACTIONS}
                    actionHandler={this.onActionInvoke.bind(this)}
        />
      </td>
    );
  }

  render() {
    const {params: {name}, networks} = this.props;
    let rows = _.get(networks, 'list', []);

    return (
      <div key={name}>
        <Helmet title="Networks"/>
        {rows && (
          <StatisticsPanel metrics={this.statisticsMetrics}
                           values={[rows.length]}
          />
        )}
        <div className="panel panel-default">
          <div>
            <NavContainer clusterName={name}/>
            <div>
              {(networks.loadingList && rows.length === 0) && (
                <div className="progressBarBlock">
                  <ProgressBar active now={100}/>
                </div>
              )}
              {(!networks.loadingList && rows.length === 0) && (
                <div className="alert alert-no-results">
                  No networks yet
                </div>
              )}
              {(!networks.loadingList && rows.length > 0) && (
                <DockTable columns={this.COLUMNS}
                           rows={rows}
                           key={name}
                />
              )}
            </div>
          </div>
          {(this.state.actionDialog) && (
            <div>
              {this.state.actionDialog}
            </div>
          )}
        </div>
      </div>);
  }

  onActionInvoke(action, network) {
    const {params: {name}} = this.props;
    switch (action) {
      case "delete":
        confirm('Are you sure you want to delete network "' + network.name + '"?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog network={network}
                               entityType="network"
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.deleteNetwork}
                               refreshData={this.props.listNetworks}
                               actionKey="deleted"
                />
              )
            });
          }).catch(()=>null);
        return;

      default:
        return;
    }
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }
}
