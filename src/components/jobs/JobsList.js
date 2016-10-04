import React, {Component, PropTypes} from 'react';
import {ActionMenu, DockTable} from '../index';
import {Panel, ProgressBar} from 'react-bootstrap';

export default class JobsList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    actions: PropTypes.object.isRequired
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
    },
    {
      name: 'none',
      label: 'Actions',
      width: '5%',
      render: (job) => {
        let actions = this.props.actions;
        return (<td key="actions" className="td-actions">
          <ActionMenu subject={job}
                    actions={actions.list}
                    actionHandler={actions.handler}
          />
        </td>);
      }
    }
  ];

  render() {
    const panelHeader = (
      <div className="clearfix">
        <h3>Jobs List</h3>
      </div>
    );
    let loading = this.props.loading;
    let data = this.props.data;
    let hasData = !loading && data && data.length !== 0;
    return (
      <div>
        <Panel header={panelHeader}>
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
