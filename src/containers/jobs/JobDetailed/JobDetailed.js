import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {PropertyGrid, ActionMenu} from '../../../components/index';
import {Link, browserHistory} from 'react-router';
import {Dropdown, SplitButton, Button, ButtonToolbar, Accordion, Panel, ProgressBar, Tabs, Tab} from 'react-bootstrap';
import {loadList, loadInfo, loadLog, deleteJob, rollbackJob} from 'redux/modules/jobs/jobs';
import _ from 'lodash';

@connect(state => ({
  jobs: state.jobs
}), {deleteJob, rollbackJob, loadList})
export default class JobDetailed extends Component {
  static propTypes = {
    params: PropTypes.object,
    jobs: PropTypes.object.isRequired,
    deleteJob: PropTypes.func.isRequired,
    rollbackJob: PropTypes.func.isRequired,
    loadList: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.props.loadList();
  }

  render() {
    const {params: {name}, deleteJob, rollbackJob} = this.props;
    const jobs = _.get(this.props.jobs, 'jobs', null);
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
          <h3 id="jobDetailsHeader">{name}&nbsp;&nbsp;
            <span className={headerClass}>{job.status}</span>&nbsp;&nbsp;
            {job.status === 'STARTED' && (
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
          Job Detailed
        </Panel>
      </div>
    );
  }

}


