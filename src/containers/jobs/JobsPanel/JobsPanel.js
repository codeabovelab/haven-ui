import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {StatisticsPanel, JobsList} from '../../../components/index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem} from 'react-bootstrap';
import {loadList} from 'redux/modules/jobs/jobs';

@connect(
  state => ({
    data: state.jobs
  }), {loadList})
export default class JobsPanel extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    loadList: PropTypes.func.isRequired
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
    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
                        values={[running, successfully, failed]}
        />
        <JobsList loading={!data}
                    data={data}
        />
      </div>
    );
  }
}

