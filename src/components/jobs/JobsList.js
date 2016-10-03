import React, {Component, PropTypes} from 'react';
import {DockTable} from '../index';
import {ProgressBar, Panel} from 'react-bootstrap';

export default class JobsList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool
  };

  COLUMNS = [
    {
      name: 'title',
      label: 'Name',
      width: '10%',
      sortable: true
    },
    {
      name: 'status',
      label: 'Status',
      width: '10%',
      sortable: true
    },
    {
      name: 'createTime',
      label: 'Create',
      width: '10%',
      sortable: true,
      formatter: "dateTime"
    },
    {
      name: 'startTime',
      label: 'Start',
      width: '10%',
      sortable: true,
      formatter: "dateTime"
    },
    {
      name: 'endTime',
      label: 'End',
      width: '10%',
      sortable: true,
      formatter: "dateTime"
    }
  ];

  render() {
    const panelHeader = (
      <div className="clearfix">
        <h3>Jobs List</h3>
      </div>
    );
    let loading = this.props.loading;
    let hasData = !loading && this.props.data && this.props.data.length;
    let noData = !loading && this.props.data && this.props.data.length === 0;
    return (
      <Panel header={panelHeader}>
        {loading && (
          <ProgressBar active now={100} />
        )}
        {hasData && (
          <DockTable columns={this.COLUMNS} rows={this.props.data} />
        )}
        {noData && (
          <div className="alert alert-info">
            No jobs yet
          </div>
        )}
      </Panel>
    );
  }
}

