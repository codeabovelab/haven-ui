import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import TimeUtils from 'utils/TimeUtils';
import {Dialog, StatisticsPanel, JobsList, PropertyGrid} from 'components';
import {Label, Badge, ButtonToolbar, ProgressBar, SplitButton, MenuItem} from 'react-bootstrap';
import {loadList, loadInfo, loadLog, deleteJob} from 'redux/modules/jobs/jobs';

@connect(
  state => ({
    data: state.jobs
  }), {loadList, loadInfo, loadLog, deleteJob})
export default class JobsPanel extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    loadList: PropTypes.func.isRequired,
    loadInfo: PropTypes.func.isRequired,
    loadLog: PropTypes.func.isRequired,
    deleteJob: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Running job',
      titles: 'Running jobs',
    },
    {
      type: 'number',
      title: 'Successfully job',
      titles: 'Successfully jobs',
    },
    {
      type: 'number',
      title: 'Failed or cancelled job',
      titles: 'Failed or cancelled jobs',
    }
  ];

  constructor(props) {
    super(props);
    this.state = {actionDialogRender: null};
  }

  componentDidMount() {
    this.props.loadList();
  }

  render() {
    require('./JobsPanel.scss');
    let data = this.props.data.jobs;
    let running = 0;
    let failed = 0;
    let successfully = 0;
    if (data) {
      data.forEach((job) => {
        switch (job.status) {
          case "COMPLETED":
            successfully++;
            break;
          case "FAILED_JOB":
          case "CANCELLED":
            failed++;
            break;
          case "STARTED":
            running++;
            break;
          default:
        }
      });
    }
    let actions = {
      list: [
        {key: "info", title: "Info"},
        {key: "log", title: "Log"},
        {key: "delete", title: "Delete"}
      ],
      handler: this.onActionInvoke.bind(this)
    };
    return (
      <div>
        <ul className="breadcrumb">
          <li className="active">Jobs</li>
        </ul>
        <StatisticsPanel metrics={this.statisticsMetrics}
                        values={[running, successfully, failed]}
        />
        <JobsList loading={!data}
                  data={data}
                  actions={actions}
        />
       {this.state.actionDialogRender && this.state.actionDialogRender()}
      </div>
    );
  }


  onActionInvoke(type, job) {
    switch (type) {
      case "info":
        this.showInfo(job);
        break;
      case "log":
        this.showLog(job);
        break;
      case "delete":
        confirm('Are you sure you want to delete this job?')
          .then(() =>this.props.deleteJob(job.id)).then(()=>this.props.loadList());
        break;
      default:
    }
  }

  showInfo(job) {
    this.props.loadInfo(job.id);
    this.setState({
      actionDialogRender: () => (
        <Dialog show
              hideCancel
              size="large"
              title={`Job info: ${job.title}`}
              okTitle="Close"
              onHide={this.hideDialog.bind(this)}
              onSubmit={this.hideDialog.bind(this)}
        >
          {this.props.data.jobInfos && (
            <PropertyGrid data={this.props.data.jobInfos[job.id]} />
          ) || (
            <ProgressBar active now={100} />
          )}
        </Dialog>)
    });
  }

  showLog(job) {
    this.props.loadLog(job.id);
    let entryRender = (e, i) => {
      let info = e.info;
      return (<tr>
        <td>{i}</td>
        <td>{TimeUtils.format(e.time)}</td>
        <td>{info.status}</td>
        <td>{e.message || (<i>none</i>)}</td>
      </tr>);
    };
    this.setState({
      actionDialogRender: () => {
        let data = this.props.data.jobLogs && this.props.data.jobLogs[job.id];
        return (
          <Dialog show
                hideCancel
                size="large"
                title={`Job log: ${job.title}`}
                okTitle="Close"
                onHide={this.hideDialog.bind(this)}
                onSubmit={this.hideDialog.bind(this)}
          >
            {data && (
              <div className="jobs-table-container">
              <table width="100%" className="table jobs-table">
                <thead>
                  <tr>
                    <th className="jobs-number-column">#</th>
                    <th className="jobs-time-column">time</th>
                    <th className="jobs-status-column">status</th>
                    <th className="jobs-text-column">message</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(entryRender)}
                </tbody>
              </table>
              </div>
            ) || (
              <ProgressBar active now={100} />
            )}
          </Dialog>);
      }
    });
  }

  hideDialog() {
    this.setState({actionDialogRender: null});
  }
}

