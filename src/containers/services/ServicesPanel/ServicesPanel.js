import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import {getClusterServices, deleteService, scaleService} from 'redux/modules/services/services';
import {connect} from 'react-redux';
import {DockTable, Chain, LoadingDialog, StatisticsPanel, ActionMenu, NavContainer} from '../../../components/index';
import {ContainerCreate, ContainerScale} from '../../../containers/index';
import { RouteHandler } from 'react-router';
import { asyncConnect } from 'redux-async-connect';
import {deleteClusterImages} from 'redux/modules/images/images';
import {Button, ButtonToolbar, ProgressBar} from 'react-bootstrap';
import _ from 'lodash';
import TimeUtils from 'utils/TimeUtils';
import Helmet from 'react-helmet';

function renderTdApplication(row) {
  let resultValue = processTdVal(row.application);
  let val = resultValue.val.length ? [resultValue.val] : [];
  return (
    <td key="application" title={resultValue.title}>
      <Chain data={val || []}
             link={`/clusters/${row.cluster}/applications`}
             maxCount={1}
      />
    </td>
  );
}

function timeFormat(row) {
  let time = row.updated ? TimeUtils.format(row.updated) : 'none';
  return (
    <td key="updated">
      {time}
    </td>
  );
}


function processTdVal(val) {
  const MAX_LENGTH = 25;
  let result = [];
  if (val) {
    result.title = val;
    let length = val.length;
    if (length >= MAX_LENGTH) {
      result.val = val.substring(0, MAX_LENGTH) + '...';
    } else {
      result.val = val;
    }
  } else {
    result.val = '';
    result.title = '';
  }
  return result;
}

function renderTdImage(row) {
  let name = _.get(row.container, 'image', '');
  let title = name ? name : '';
  let match = name.match(/[^/]+$/);
  name = match && match[0] ? match[0] : name;
  const MAX_LENGTH = 25;
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

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];

    if (!clusterActions.isLoaded(getState())) {
      promises.push(dispatch(clusterActions.load()));
    }
    return Promise.all(promises);
  }
}])
@connect(
  state => ({
    clusters: state.clusters,
    services: state.services,
    events: state.events,
  }), {
    loadClusters: clusterActions.load,
    getClusterServices,
    deleteClusterImages,
    deleteService,
    scaleService
  })
export default class ServicesPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    events: PropTypes.object,
    params: PropTypes.object,
    services: PropTypes.object,
    getClusterServices: PropTypes.func.isRequired,
    deleteService: PropTypes.func.isRequired,
    scaleService: PropTypes.func.isRequired,
    loadClusters: PropTypes.func.isRequired,
  };

  statisticsMetricsNodesUp = [
    {
      type: 'number',
      title: 'Service',
      titles: 'Services'
    },
    {
      type: 'number',
      title: 'Node Running',
      titles: 'Nodes Running'
    },
    {
      type: 'number',
      title: 'Application',
      titles: 'Applications'
    },
    {
      type: 'number',
      title: 'Event',
      titles: 'Events'
    }
  ];

  statisticsMetricsNodesDown = [
    {
      type: 'number',
      title: 'Service',
      titles: 'Services'
    },
    {
      type: 'number',
      title: 'Node Down',
      titles: 'Nodes Down',
      highlight: true
    },
    {
      type: 'number',
      title: 'Application',
      titles: 'Applications'
    },
    {
      type: 'number',
      title: 'Event',
      titles: 'Events'
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
      width: '20%%'
    },

    {
      name: 'ports',
      render: this.renderTdPorts,
      width: '10%'
    },

    {
      name: 'application',
      render: renderTdApplication,
      width: '10%'
    },

    {
      name: 'updated',
      width: '20%',
      render: timeFormat,
    },

    {
      name: 'actions',
      width: '5%',
    }
  ];

  ACTIONS = [
    {
      key: "scale",
      title: "Scale"
    },
    {
      key: "delete",
      title: "Delete",
      default: true
    }
  ];

  componentDidMount() {
    const {loadClusters, params: {name}, getClusterServices} = this.props;
    this.state = {};
    loadClusters();
    getClusterServices(name);
    $('.input-search').focus();
  }

  renderTdPorts(row) {
    let ports = row.ports;
    let portsCoupled = [];
    ports.map((el) => {
      if (checkPort(el.publicPort) && checkPort(el.privatePort)) {
        portsCoupled.push(el.publicPort + ":" + el.privatePort + '(' + el.type + '/' + el.mode + ')');
      }
    });
    return (
      <td key="ports">
        <span>{portsCoupled.join(', ')}</span>
      </td>
    );
  }

  render() {
    const {clusters, params: {name}, services} = this.props;
    const cluster = clusters[name];
    let rows = [];
    if (!cluster) {
      return (
        <div></div>
      );
    }
    const data = _.get(services, `${name}`, null);
    if (data) {
      for (let el in data) {
        if (!data.hasOwnProperty(el)) {
          continue;
        }
        rows.push(data[el]);
      }
    }
    this.additionalData(rows);
    let servicesNumber = rows.length;
    let runningNodes = 0;
    let downNodes = 0;
    let Apps = 0;
    let eventsCount = 0;
    let events = this.props.events['bus.cluman.errors-stats'];
    if (events) {
      if (name && name !== 'all') {
        events = _.filter(events, (el)=>(el.lastEvent.cluster === name));
      }
      _.forEach(events, (value, key) => {
        eventsCount += value.count;
      });
    }
    if (name === 'all') {
      _.forEach(clusters, (el)=> {
        Apps += _.size(el.applications);
      });
    } else {
      Apps = _.size(cluster.applications);
    }

    if (typeof(cluster.nodes.on) !== 'undefined') {
      runningNodes = cluster.nodes.on;
    }

    if (typeof(cluster.nodes.off) !== 'undefined') {
      downNodes = cluster.nodes.off;
    }

    const isAllPage = name === 'all';

    let columns = this.COLUMNS;

    columns.forEach(column => column.sortable = column.name !== 'actions');

    return (
      <div key={name}>
        <Helmet title="Services"/>
        {(runningNodes > 0 || runningNodes === downNodes) && (
          <StatisticsPanel metrics={this.statisticsMetricsNodesUp}
                           cluster={cluster}
                           values={[servicesNumber, runningNodes, Apps, eventsCount]}
          />
        )}
        {(runningNodes === 0 && downNodes > 0) && (
          <StatisticsPanel metrics={this.statisticsMetricsNodesDown}
                           cluster={cluster}
                           values={[servicesNumber, downNodes, Apps, eventsCount]}
          />
        )}
        <div className="panel panel-default">
          <NavContainer clusterName={name}/>
          {rows && (
            <div>
              {!isAllPage && (
                <ButtonToolbar className="pulled-right-toolbar">
                  <Button
                    bsStyle="primary"
                    onClick={this.onActionInvoke.bind(this, "create")}
                  >
                    <i className="fa fa-plus"/>&nbsp;
                    New Service
                  </Button>
                </ButtonToolbar>
              )}
              <div className="services">
                <DockTable columns={columns}
                           rows={rows}
                           key={name}
                />
              </div>
            </div>
          )}
          {(rows.length === 0 && services.loading) && (
            <div className="progressBarBlock">
              <ProgressBar active now={100}/>
            </div>
          )}
          {(rows.length === 0 && !services.loading) && (
            <div className="alert alert-info">
              No services yet
            </div>
          )}
        </div>


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
        row.actions = this.tdActions.bind(this);
        row.image = row.container.image;
      });
    }
  }

  tdActions(row) {
    return (
      <td className="td-actions" key="actions">
        <ActionMenu subject={row.id}
                    actions={this.ACTIONS}
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

  createLoadingDialog(currentService, longTermAction, actionKey) {
    const {params: {name}} = this.props;

    return (
      <LoadingDialog service={currentService}
                     entityType="service"
                     onHide={this.onHideDialog.bind(this)}
                     name={name}
                     longTermAction={longTermAction}
                     refreshData={this.props.getClusterServices}
                     actionKey={actionKey}
      />
    );
  }

  onActionInvoke(action, serviceId) {
    const {clusters, params: {name}, services} = this.props;
    const servicesList = _.get(services, `${name}`, []);
    let cluster = clusters[name];
    let currentService;
    if (serviceId) {
      currentService = _.get(servicesList, `${serviceId}`, null);
    }

    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <ContainerCreate title="Create New Service"
                             service
                             cluster={cluster}
                             onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "scale":
        this.setState({
          actionDialog: (
            <ContainerScale service={currentService}
                            onHide={this.onHideDialog.bind(this)}
                            name={name}
            />
          )
        });
        return;

      case "delete":
        confirm('Are you sure you want to delete service "' + currentService.name + '" ?')
          .then(() => {
            this.setState({
              actionDialog: this.createLoadingDialog(currentService, this.props.deleteService, 'deleted')
            });
          }).catch(()=>null);
        return;

      default:
        return;
    }
  }
}

function checkPort(port) {
  return typeof(port) !== "undefined" && port !== 0;
}
