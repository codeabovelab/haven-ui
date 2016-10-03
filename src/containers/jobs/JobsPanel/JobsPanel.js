import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {StatisticsPanel, JobsList} from '../../../components/index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem} from 'react-bootstrap';

@connect(
  state => ({
  }), {})
export default class JobsPanel extends Component {
  static propTypes = {
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

  }

  render() {
    let data = [
      {
        "id": "job.sample-0",
        "title": "job.sample",
        "status": "COMPLETED",
        "createTime": "2016-10-03T15:42:59.516",
        "startTime": "2016-10-03T15:42:59.533",
        "endTime": "2016-10-03T15:42:59.552",
        "running": false
      },
      {
        "id": "job.sample-1",
        "title": "job.sample",
        "status": "FAILED_JOB",
        "createTime": "2016-10-03T15:43:02.681",
        "startTime": "2016-10-03T15:43:02.681",
        "endTime": "2016-10-03T15:43:02.686",
        "running": false
      }
    ];
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

