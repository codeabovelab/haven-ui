import React, {Component, PropTypes} from 'react';
import {DockTable} from 'components';
import {ProgressBar} from 'react-bootstrap';
import moment from 'moment';

export default class EventLog extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    data: PropTypes.array
  };

  COLUMNS = [
    {
      name: 'date',
      label: 'Time',
      width: '15%',
      sortable: true,
      render: this.dateRender
    },
    {
      name: 'severity',
      label: 'Severity',
      width: '10%'
    },
    {
      name: 'action',
      label: 'Action',
      width: '10%'
    },
    {
      name: 'cluster',
      label: 'Cluster',
      width: '15%',
      sortable: true
    },
    {
      name: 'container',
      label: 'Container',
      width: '15%',
      render: this.containerRender
    },
    {
      name: 'node',
      label: 'Node',
      width: '15%'
    }
  ];

  dateRender(row) {
    return (
      <td key="date">
        {row.date.substring(11, 19) + ' ' + row.date.substring(0, 10)}
      </td>
    );
  }

  containerRender(row) {
    return (
      <td key="container">
        {row.container ? row.container.name : ""}
      </td>
    );
  }

  render() {
    return (
      <div>
        {this.props.loading && (
          <ProgressBar active now={100} />
        )}

        {(this.props.data && !this.props.loading) && (
          <DockTable columns={this.COLUMNS}
                     rows={this.props.data}
                     striped={false}
                     searchable={false}
          />
        )}
        {(this.props.data && this.props.data.length === 0) && (
          <div className="alert alert-info">
            No events yet
          </div>
        )}
      </div>
    );
  }
}
