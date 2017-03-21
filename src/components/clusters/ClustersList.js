import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff, Chain, ActionMenu} from '../index';
import _ from 'lodash';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class ClustersList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    onNewCluster: PropTypes.func,
    onActionInvoke: PropTypes.func.isRequired,
    currentUserRole: PropTypes.string
  };

  COLUMNS = [
    {
      name: 'name',
      label: 'ID',
      width: '15%',
      sortable: true,
      render: this.nameRender
    },
    {
      name: 'description',
      label: 'Description',
      sortable: true
    },
    {
      name: 'features',
      label: 'Type',
      sortable: true,
      render: this.typeRender
    },
    {
      name: 'containers',
      label: '# of Containers',
      width: '15%',
      render: this.containersRender
    },
    {
      name: 'nodes',
      label: '# of Nodes',
      width: '15%',
      render: this.nodesRender
    },
    {
      name: 'alertsCount',
      label: '# of Alerts',
      sortable: true,
      render: this.alertsRender
    },
    {
      name: 'applications',
      label: 'Applications',
      render: this.applicationsRender
    },
    {
      name: 'Actions',
      width: '50px',
      render: this.actionsRender.bind(this)
    }
  ];

  ACTIONS = [
    {
      key: "edit",
      title: "Edit",
      default: true
    },
    {
      key: "manageNodes",
      title: "Manage Nodes"
    },
    null,
    {
      key: "information",
      title: "Information"
    },
    {
      key: "config",
      title: "Config"
    },
    null,
    {
      key: "delete",
      title: "Delete",
      disabled: this.props.currentUserRole === "ROLE_USER"
    },
    {
      key: "deleteImages",
      title: "Delete Images"
    },
  ];

  componentDidMount() {
    $(window).resize(()=> {
      let $box = $("#contentBox");
      let $toolBar = $("#toolBar");
      if ($box.width() < 480) {
        $toolBar.removeClass("pulled-right");
      } else {
        $toolBar.addClass("pulled-right");
      }
    });
  }

  render() {
    const panelHeader = (
      <div className="clearfix">
        <h3>Cluster List</h3>

      </div>
    );

    return (
      <Panel header={panelHeader}>
        {this.props.loading && (
          <ProgressBar active now={100} />
        )}

        {(this.props.data && !this.props.loading) && (
          <div id="contentBox">
            {this.props.currentUserRole !== "ROLE_USER" && (
              <ButtonToolbar id="toolBar" className="pulled-right">
                <Button
                  bsStyle="primary"
                  onClick={this.props.onNewCluster}
                >
                  <i className="fa fa-plus"/>&nbsp;
                  New Cluster
                </Button>
              </ButtonToolbar>
            )}
            <DockTable columns={this.COLUMNS}
                       rows={this.props.data}
            />
          </div>
        )}
      </Panel>
    );
  }

  nameRender(cluster) {
    return (
      <td key="name">
        <Link to={`/clusters/${cluster.name}`}>{cluster.name}</Link>
      </td>
    );
  }

  typeRender(cluster) {
    return (
      <td key="features">
        <span>{_.get(cluster, 'features[0]', '')}</span>
      </td>
    );
  }

  containersRender(cluster) {
    return (
      <td key="containers">
        <OnOff on={cluster.containers.on}
               off={cluster.containers.off}
               href={"/clusters/" + cluster.name}/>
      </td>
    );
  }

  nodesRender(cluster) {
    return (
      <td key="nodes">
        <OnOff on={cluster.nodes.on}
               off={cluster.nodes.off}
               href="/nodes"/>
      </td>
    );
  }

  actionsRender(cluster) {
    return (
      <td key="actions" className="td-actions">
        <ActionMenu subject={cluster.name}
                    actions={this.ACTIONS}
                    actionHandler={this.props.onActionInvoke.bind(this)}
        />
      </td>
    );
  }

  applicationsRender(cluster) {
    return (
      <td key="applications">
        <Chain data={cluster.applications || []}
               link={"/clusters/" + cluster.name + "/applications"}
               maxCount={3}
        />
      </td>
    );
  }

  alertsRender(cluster) {
    return (
      <td key="alerts">
        <Link to={`/clusters/${cluster.name}/events`}>{cluster.alertsCount}</Link>
      </td>
    );
  }
}
