import React, {Component, PropTypes} from 'react';
import * as clusterActions from 'redux/modules/clusters/clusters';
import * as applicationActions from 'redux/modules/application/application';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import {DockTable, LoadingDialog, ActionMenu} from '../../../components/index';
import { asyncConnect } from 'redux-async-connect';
import {Button, ButtonToolbar, Panel, ProgressBar} from 'react-bootstrap';
import {ApplicationCreate} from '../../../containers/index';

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
    application: state.application.applicationsList
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
    let applicationContainers = [];
    const containers = this.props.containers;
    for (let el in application.containers) {
      if (application.containers.hasOwnProperty(el)) {
        let containerId = application.containers[el];
        if (containers[containerId]) {
          applicationContainers.push(containers[containerId].image);
        }
      }
    }
    return (
      <td key="containers">
        {applicationContainers.map(function listContainers(container, i) {
          return <p key={i}>{container}</p>;
        })}
      </td>
    );
  }

  componentDidMount() {
    const {listApps, loadContainers, params: {name}} = this.props;
    this.state = {};
    loadContainers(name);
    listApps(name);
  }

  render() {
    this.COLUMNS.forEach(column => column.sortable = column.name !== 'actions');
    const GROUP_BY_SELECT = ['name', 'creatingDate'];
    const {containers, application, params: {name}} = this.props;
    if (!application) {
      return (
        <div></div>
      );
    }
    const applications = application[name];
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

    this.additionalData(rows);
    const applicationsHeaderBar = (
      <div className="clearfix">
        <h3>Applications</h3>

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.onActionInvoke.bind(this, "create")}
          >
            <i className="fa fa-plus" />&nbsp;
            New Application
          </Button>
        </ButtonToolbar>
      </div>
    );

    return (
      <div>
        <h1>
          <Link to={"/clusters/" + name}>Clusters/{name}</Link>
        </h1>

        <Panel header={applicationsHeaderBar}>
          {!rows && (
            <ProgressBar active now={100} />
          )}

          {(rows && rows.length > 0) && (
            <div>
              <div className="applications">
                <DockTable columns={this.COLUMNS}
                           rows={rows}
                           groupBySelect={GROUP_BY_SELECT}
                           size={DockTable.SIZES.SM}
                />
              </div>
            </div>
          )}

          {(rows && rows.length === 0) && (
            <div className="alert alert-info">
              No applications yet
            </div>
          )}
        </Panel>

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

  onActionInvoke(action, application) {
    const {clusters, params: {name}} = this.props;
    let cluster = clusters[name];

    let currentApplication;
    if (application) {
      currentApplication = this.props.application[name][application];
    }

    switch (action) {
      case "start":
        confirm('Are you sure you want to start application?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog application={currentApplication}
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.startApp}
                               loadContainers={this.props.loadContainers}
                               actionKey="started"
                               listApps={this.props.listApps}
                />
              )
            });
          });
        return;

      case "stop":
        confirm('Are you sure you want to stop application?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog application={currentApplication}
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.stopApp}
                               loadContainers={this.props.loadContainers}
                               actionKey="stopped"
                               listApps={this.props.listApps}
                />
              )
            });
          });
        return;

      case "delete":
        confirm('Are you sure you want to delete this application?')
          .then(() => {
            this.setState({
              actionDialog: (
                <LoadingDialog application={currentApplication}
                               onHide={this.onHideDialog.bind(this)}
                               name={name}
                               longTermAction={this.props.deleteApp}
                               loadContainers={this.props.loadContainers}
                               actionKey="deleted"
                               listApps={this.props.listApps}
                />
              )
            });
          });
        return;

      case "getCompose":
         this.props.getComposeApp(name, currentApplication.name).then((response)=>{
           let link = document.createElement("a");
           let parsedData = "text/json;charset=utf-8," + encodeURIComponent(response._res.text);
           link.href = 'data:' + parsedData;
           link.download = 'data.json';
           link.click();
      });
        return;
      case "getInitFile":
        this.props.getInitFile(name, currentApplication.name);
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
