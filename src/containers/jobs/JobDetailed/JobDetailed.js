import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {PropertyGrid, ActionMenu, DockTable} from '../../../components/index';
import {Link, browserHistory} from 'react-router';
import {Dropdown, SplitButton, Button, ButtonToolbar, Accordion, Panel, ProgressBar, Tabs, Tab} from 'react-bootstrap';
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
      width: '20%'
    },
    {
      name: 'status',
      width: '20%'
    },
    {
      name: 'message',
      width: '20%'
    }
  ];

  render() {
    const {params: {name}, deleteJob, rollbackJob} = this.props;
    const jobs = _.get(this.props.jobs, 'jobs', null);
    const info = _.get(this.props.jobs, 'jobInfos', null);
    const log = _.get(this.props.jobs, 'jobLogs', null);
    const job = jobs ? jobs[name] : null;
    let headerClass = '';
    let jobHeaderBar;
    console.log('Jobs: ', jobs);
    console.log('name: ', name);
    console.log('Job: ', job);
    if (job) {
      switch (job.status) {
        case "COMPLETED":
          headerClass = "success-header";
          break;
        case "FAILED":
          headerClass = "warning-header";
          break;
        default:
          break;
      }
      jobHeaderBar = (
        <div className="clearfix">
          <h3 id="jobDetailsHeader">{job.title}&nbsp;&nbsp;
            <span className={headerClass}>{job.status}</span>&nbsp;&nbsp;
            {job.running && (
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
        <ul className="breadcrumb">
          <li><Link to="/jobs">Jobs</Link></li>
          <li className="active">{name}</li>
        </ul>
        <Panel header={jobHeaderBar}>
          <PropertyGrid data={_.assign({},
            {title: job.title}, {status: job.status}, {created: TimeUtils.format(job.createTime)}, {started: TimeUtils.format(job.startTime)},
            {ended: TimeUtils.format(job.endTime)}, {schedule: job.parameters.schedule}, {type: job.parameters.type},
            {id: job.id}, {running: job.running}, {canRollback: job.canRollback})}/>
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
            <Tab eventKey={2} title="Log">
              {(log && log[job.id]) && (
                <DockTable columns={this.COLUMNS}
                           rows={log[job.id]}
                           striped={false}
                           searchable={false}
                />
              ) || (
                <div className="alert alert-info">
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


