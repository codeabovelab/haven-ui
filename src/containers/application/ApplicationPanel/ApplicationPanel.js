import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as applicationActions from 'redux/modules/application/application';
import {connect} from 'react-redux';
import { Link, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {DockTable, LoadingDialog, Chain, NavContainer, ActionMenu, StatisticsPanel} from '../../../components/index';
import { asyncConnect } from 'redux-async-connect';
import {Button, ButtonToolbar, ProgressBar, Popover, Nav, NavItem} from 'react-bootstrap';
import {ApplicationCreate} from '../../../containers/index';
import {downloadFile} from '../../../utils/fileActions';
import _ from 'lodash';

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
    containers: state.containers,
    application: state.application.applicationsList,
    events: state.events
  }), {
    loadContainers: clusterActions.loadContainers,
    listApps: applicationActions.list,
    deleteApp: applicationActions.deleteApplication,
    loadApp: applicationActions.load,
    addApp: applicationActions.add,
    getComposeApp: applicationActions.getCompose,
    uploadAsStream: applicationActions.uploadStream,
    uploadAsFile: applicationActions.uploadFile,
    getInitFile: applicationActions.getInitFile,
    startApp: applicationActions.start,
    stopApp: applicationActions.stop
  })
export default class ApplicationPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    application: PropTypes.object,
    containers: PropTypes.object,
    params: PropTypes.object,
    events: PropTypes.object,
    loadContainers: PropTypes.func.isRequired,
    listApps: PropTypes.func.isRequired,
    deleteApp: PropTypes.func.isRequired,
    loadApp: PropTypes.func.isRequired,
    addApp: PropTypes.func.isRequired,
    getComposeApp: PropTypes.func.isRequired,
    uploadAsStream: PropTypes.func.isRequired,
    uploadAsFile: PropTypes.func.isRequired,
    getInitFile: PropTypes.func.isRequired,
    startApp: PropTypes.func.isRequired,
    stopApp: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Container Running',
      titles: 'Containers Running',
      link: '/containers'
    },
    {
      type: 'number',
      title: 'Node Running',
      titles: 'Nodes Running',
      link: '/nodes'
    },
    {
      type: 'number',
      title: 'Application',
      titles: 'Applications',
      link: '/applications'
    },
    {
      type: 'number',
      title: 'Event',
      titles: 'Events',
      link: '/events'
    }
  ];

  ACTIONS = [
    {
      key: "start",
      title: "Start (Up)",
      default: true
    },
    null,
    {
      key: "stop",
      title: "Stop"
    },
    {
      key: "update",
      title: "Update"
    },
    {
      key: "delete",
      title: "Delete"
    },
    {
      key: "getInitFile",
      title: "Get Init File"
    },
    {
      key: "getCompose",
      title: "Get Config"
    }

  ];

  COLUMNS = [
    {
      name: 'name'
    },

    {
      name: 'containers',
      render: this.containersRender.bind(this)
    },

    {
      name: 'creatingDate',
      width: '200px'
    },

    {
      name: 'actions',
      width: '50px'
    }
  ];

  containersRender(application) {
    let chainContainers = [];
    const containers = this.props.containers;
    for (let el in application.containers) {
      if (application.containers.hasOwnProperty(el)) {
        let containerId = application.containers[el];
        if (containers[containerId]) {
          chainContainers.push(containers[containerId]);
        }
      }
    }
    let popoverRender = (el) => (
      <Popover id={el.image}>
        <span>Image: {shortenName(el.image) || ''}</span>
        <br></br>
        <span>Status: {shortenName(el.status) || ''}</span>
      </Popover>
  );
    return (
      <td key="containers">
        <Chain data={chainContainers}
               popoverPlacement="top"
               popoverRender={popoverRender}
               render={(container) => (<span title={String(container.name) || ""}>{String(container.name) || ""}</span>)}
        />
      </td>
    );
  }

  componentDidMount() {
    const {listApps, loadContainers, params: {name}} = this.props;
    this.state = {};
    loadContainers(name);
    listApps(name);
  }

  countStatistics(events, rows, containers, cluster) {
    let resultStat = {
      runningContainers: 0,
      runningNodes: 0,
      apps: 0,
      eventsCount: 0
    };
    if (events) {
      let eventsFiltered = events;
      if (name && name !== 'all') {
        eventsFiltered = _.filter(eventsFiltered, (el)=>(el.lastEvent.cluster === name));
      }
      _.forEach(eventsFiltered, (value, key) => {
        resultStat.eventsCount += value.count;
      });
    }
    if (rows) {
      resultStat.apps = rows.length;
    }
    if (containers && _.size(containers) > 0) {
      _.forEach(containers, (container) => {
        if (container.run && (cluster.name === 'all' || cluster.name === container.cluster)) {
          resultStat.runningContainers++;
        }
      });
    }
    if (typeof(cluster.nodes.on) !== 'undefined') {
      resultStat.runningNodes = cluster.nodes.on;
    }
    return resultStat;
  }

  render() {
    this.COLUMNS.forEach(column => column.sortable = column.name !== 'actions');
    const css = require('./ApplicationPanel.scss');
    const GROUP_BY_SELECT = ['name', 'creatingDate'];
    const {containers, clusters, application, params: {name}} = this.props;
    const cluster = clusters[name];
    const applications = _.get(application, name, null);
    let rows = [];
    if (applications == null) {
      rows = null;
    } else {
      for (let el in applications) {
        if (applications.hasOwnProperty(el)) {
          rows.push(applications[el]);
        }
      }
    }
    let events = this.props.events['bus.cluman.errors-stats'];
    const stats = this.countStatistics(events, rows, containers, cluster);
    this.additionalData(rows);

    return (
      <div>
        {cluster && (
          <StatisticsPanel metrics={this.statisticsMetrics}
                           cluster={cluster}
                           values={[stats.runningContainers, stats.runningNodes, stats.apps, stats.eventsCount]}
          />
        )}
        <div className="panel panel-default">
          <div>
            <NavContainer clusterName={name}/>
            {rows && (
              <div>
                <ButtonToolbar className="pulled-right-toolbar">
                  <Button
                    bsStyle="primary"
                    className="pulled-right"
                    onClick={this.onActionInvoke.bind(this, "create")}
                  >
                    <i className="fa fa-plus"/>&nbsp;
                    New Application
                  </Button>
                </ButtonToolbar>

                <div className="applications">
                  <DockTable columns={this.COLUMNS}
                             rows={rows}
                             groupBySelect={GROUP_BY_SELECT}
                             size={DockTable.SIZES.SM}
                  />
                </div>
              </div>
            )}
            {!rows && (
              <div className={css.progressBarBlock}>
                <ProgressBar active now={100}/>
              </div>
            )}
            </div>

          {(rows && rows.length === 0) && (
            <div className="alert alert-info">
              No applications yet
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
    require('jquery-ui/ui/widgets/datepicker');
    if (rows) {
      rows.forEach(row => {
        row.actions = this.tdActions.bind(this);
        row.creatingDate = $.datepicker.formatDate("M d, yy", new Date(row.creatingDate));
      });
    }
  }

  tdActions(application) {
    return (
      <td className="td-actions" key="actions">
        <ActionMenu subject={application.name}
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

  createLoadingDialog(currentApplication, longTermAction, actionKey) {
    const {params: {name}, listApps, loadContainers} = this.props;
    return (
      <LoadingDialog application={currentApplication}
                     onHide={this.onHideDialog.bind(this)}
                     name={name}
                     longTermAction={longTermAction}
                     loadContainers={loadContainers}
                     actionKey={actionKey}
                     listApps={listApps}
      />
    );
  }

  onActionInvoke(action, application) {
    const {params: {name}} = this.props;
    let currentApplication;
    if (application) {
      currentApplication = this.props.application[name][application];
    }

    switch (action) {
      case "start":
        confirm('Are you sure you want to start application?')
          .then(() => {
            this.setState({
              actionDialog: this.createLoadingDialog(currentApplication, this.props.startApp, 'started')
            });
          });
        return;

      case "stop":
        confirm('Are you sure you want to stop application?')
          .then(() => {
            this.setState({
              actionDialog: this.createLoadingDialog(currentApplication, this.props.stopApp, 'stopped')
            });
          });
        return;

      case "delete":
        confirm('Are you sure you want to delete this application?')
          .then(() => {
            this.setState({
              actionDialog: this.createLoadingDialog(currentApplication, this.props.deleteApp, 'deleted')
            });
          });
        return;

      case "getCompose":
        this.props.getComposeApp(name, currentApplication.name).then((response)=> {
          let data = 'text/json;charset=utf-8,' + encodeURIComponent(response._res.text);
          downloadFile(data, currentApplication.name + '-config.json' );
        });
        return;

      case "getInitFile":
        this.props.getInitFile(name, currentApplication.name).then((response)=>{
          let header = response._res.headers['content-disposition'] || response._res.header['content-disposition'];
          let fileName = header ? header.match(/filename=(.+)/)[1] : currentApplication.name + '-init-file.yml';
          let data = 'application/octet-stream;charset=utf-8,' + encodeURIComponent(response._res.text);
          downloadFile(data, fileName);
        });
        return;

      case "create":
        this.setState({
          actionDialog: (
            <ApplicationCreate title="Create New Application"
                               clusterName={name}
                               loadContainers={this.props.loadContainers}
                               onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "update":
        this.setState({
          actionDialog: (
            <ApplicationCreate title={"Update Application " + '"' + currentApplication.name + '"'}
                               clusterName={name}
                               application={currentApplication}
                               loadContainers={this.props.loadContainers}
                               onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      default:
        return;
    }
  }
}

function shortenName(name) {
  let result = String(name);
  const MAX_LENGTH = 25;
  if (name.length > MAX_LENGTH) {
    result = name.substr(0, MAX_LENGTH) + '...';
  }
  return result;
}
