import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog, StatisticsPanel, JobsList, PropertyGrid} from 'components';
import {Label, Badge, ButtonToolbar, ProgressBar, SplitButton, MenuItem} from 'react-bootstrap';
import {loadList, loadInfo} from 'redux/modules/jobs/jobs';

@connect(
  state => ({
    data: state.jobs
  }), {loadList, loadInfo})
export default class JobsPanel extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    loadList: PropTypes.func.isRequired,
    loadInfo: PropTypes.func.isRequired
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
        {key: "log", title: "Log"}
      ],
      handler: this.onActionInvoke.bind(this)
    };
    return (
      <div>
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
      case "info": this.showInfo(job);
        break;
      case "log":
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

  hideDialog() {
    this.setState({actionDialogRender: null});
  }
}

