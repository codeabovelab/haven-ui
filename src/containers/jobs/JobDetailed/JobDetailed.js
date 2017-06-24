import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {PropertyGrid, ActionMenu, DockTable} from '../../../components/index';
import {Link, browserHistory} from 'react-router';
import {Dropdown, SplitButton, Button, ButtonToolbar, Accordion, Panel, ProgressBar, Tabs, Tab, Badge} from 'react-bootstrap';
import {loadList, loadInfo, loadLog, deleteJob, rollbackJob} from 'redux/modules/jobs/jobs';
import _ from 'lodash';
import TimeUtils from 'utils/TimeUtils';

@connect(state => ({
  jobs: state.jobs
}), {deleteJob, rollbackJob, loadList, loadInfo, loadLog})
export default class JobDetailed extends Component {
  static propTypes = {
    params: PropTypes.object,
    jobs: PropTypes.object.isRequired,
    deleteJob: PropTypes.func.isRequired,
    rollbackJob: PropTypes.func.isRequired,
    loadList: PropTypes.func.isRequired,
    loadInfo: PropTypes.func.isRequired,
    loadLog: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {params: {name}, loadList, loadInfo, loadLog} = this.props;
    loadList();
    loadLog(name);
    loadInfo(name);
  }

  COLUMNS = [
    {
      name: 'time',
      width: '7%',
      render: this.timeRender,
      sortable: true
    },
    {
      name: 'status',
      width: '5%',
      render: this.statusRender
    },
    {
      name: 'message',
      width: '88%'
    }
  ];

  timeRender(row) {
    return (
      <td key="time">
        <span>{TimeUtils.format(row.time)}</span>
      </td>
    );
  }

  statusRender(row) {
    return (
      <td key="status">
        <span>{row.info.status}</span>
      </td>
    );
  }

  render() {
    const {params: {name}, deleteJob, rollbackJob, loadLog} = this.props;
    const jobs = _.get(this.props.jobs, 'jobs', null);
    const info = _.get(this.props.jobs, 'jobInfos', null);
    const log = _.get(this.props.jobs, 'jobLogs', null);
    const job = jobs ? jobs[name] : null;
    let title = '';
    let headerClass = 'common-badge';
    let jobHeaderBar;
    if (job) {
      title = job.title.length > 0 ? job.title : job.id;
      switch (job.status) {
        case "COMPLETED":
          headerClass = "success-badge";
          break;
        case "FAILED":
          headerClass = "warning-badge";
          break;
        default:
          break;
      }
      jobHeaderBar = (
        <div className="clearfix">
          <h3 id="jobDetailsHeader">{title}&nbsp;&nbsp;
            <Badge bsClass={"badge detailed-status-badge " + headerClass}>{job.status}</Badge>&nbsp;&nbsp;
            {job.status === "STARTED" && (
              <i className="fa fa-spinner fa-pulse"/>
            )}
          </h3>
          <ButtonToolbar>
            <Button
              bsStyle="primary"
              title="Delete Job"
              onClick={()=> confirm('Are you sure you want to remove this job?').then(()=>deleteJob(job.id).then(()=>browserHistory.push('/jobs')).catch(() => null))}
            >
              <i className="fa fa-bomb"/>&nbsp;Delete
            </Button>
            <Button
              bsStyle="primary"
              disabled={!job.canRollback}
              title={!job.canRollback ? "Rollback unavailable for this job" : "Rollback Job"}
              onClick={()=> confirm('Are you sure you want to roll back this job?').then(()=>rollbackJob(job.id).then(()=>browserHistory.push('/jobs')).catch(() => null))}
            >
              <i className="fa fa-reply"/>&nbsp;Rollback
            </Button>
          </ButtonToolbar>
        </div>
      );
    } else {
      return (
        <div><ProgressBar active now={100}/></div>
      );
    }

    return (
      <div>
        <Panel header={jobHeaderBar}>
          <PropertyGrid data={_.assign({},
            {title: job.title}, {status: job.status}, {created: TimeUtils.format(job.createTime)}, {started: TimeUtils.format(job.startTime)},
            {ended: TimeUtils.format(job.endTime)}, {schedule: _.get(job, 'parameters.schedule', '')}, {type: _.get(job, 'parameters.type', '')},
            {id: job.id}, {canRollback: job.canRollback})}/>
        </Panel>
        <div className="panel panel-default">
          <Tabs defaultActiveKey={1} id="tabContainerProps">
            <Tab eventKey={1} title="Parameters">
              {(info && info[job.id]) && (
                <PropertyGrid data={info[job.id].parameters.parameters}/>
              ) || (
                <ProgressBar active now={100}/>
              )}
            </Tab>
            <Tab eventKey={2} title="Log" onEnter={()=>loadLog(job.id)}>
              {(log && log[job.id]) && (
                <DockTable columns={this.COLUMNS}
                           rows={log[job.id]}
                           striped={false}
                           searchable={false}
                           nullDisplayName=""
                />
              ) || (
                <div className="alert alert-no-results">
                  No log entries available
                </div>
              )}
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}


