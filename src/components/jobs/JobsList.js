import React, {Component, PropTypes} from 'react';
import {ActionMenu, DockTable} from '../index';
import {Panel, ProgressBar, Badge} from 'react-bootstrap';
import TimeUtils from 'utils/TimeUtils';
import {Link} from 'react-router';

export default class JobsList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    actions: PropTypes.object.isRequired,
    actionHandler: PropTypes.func.isRequired
  };

  COLUMNS = [
    {
      name: 'title',
      label: 'Name',
      width: '20%',
      sortable: true,
      render: this.nameRender
    },
    {
      name: 'status',
      label: 'Status',
      width: '15%',
      sortable: true,
      render: this.statusRender
    },
    {
      name: 'createTime',
      label: 'Create',
      width: '15%',
      sortable: true,
      formatter: "dateTime"
    },
    {
      name: 'startTime',
      label: 'Start',
      width: '15%',
      sortable: true,
      formatter: "dateTime"
    },
    {
      name: 'endTime',
      label: 'End',
      width: '15%',
      sortable: true,
      render: this.endTimeRender
    },
    {
      name: 'none',
      label: 'Actions',
      width: '1%',
      render: this.renderTdActions.bind(this)
    }
  ];


  renderTdActions(job) {
    const {actions, actionHandler} = this.props;
    let actionsList = [];
    if (job.canRollback === true) {
      actionsList = actions.commonList;
    } else {
      actionsList = actions.rollbackDisList;
    }
    return (<td key={"actions" + job.id} className="td-actions">
      <ActionMenu subject={job}
                  actions={actionsList}
                  actionHandler={actionHandler}
      />
    </td>);
  }

  endTimeRender(job) {
    let endTime = TimeUtils.format(job.endTime);
    endTime = endTime === "Invalid Date" ? "In Process" : endTime;
    return (
      <td key="endTime">
        <span>{endTime}</span>
      </td>
    );
  }

  statusRender(job) {
    let status = job.status;
    let statusClass = 'off-status-count';
    switch (status) {
      case "FAILED":
        statusClass = 'warning-status-count';
        break;
      case "COMPLETED":
        statusClass = 'up-status-count';
        break;
      default:
        break;
    }
    return (
      <td key="status" title={status}>
        <Badge bsClass={"badge " + statusClass}>{status}</Badge>
      </td>
    );
  }

  nameRender(job) {
    return (
      <td key="name">
        <Link className="link" to={"/jobs/" + job.id}>{job.title}</Link>
      </td>
    );
  }

  render() {
    let loading = this.props.loading;
    let data = this.props.data;
    let hasData = !loading && data && data.length !== 0;
    return (
      <div>
        <Panel>
          {loading && (
            <ProgressBar active now={100} />
          ) || hasData && (
            <DockTable columns={this.COLUMNS} rows={data} />
          ) || (
            <div className="alert alert-info">
              No jobs yet
            </div>
          )}
        </Panel>
      </div>
    );
  }
}
