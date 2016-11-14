import React, {Component, PropTypes} from 'react';
import {DockTable} from 'components';
import {Link} from 'react-router';
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
      sortable: true,
      render: this.clusterRender
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
    let date = "";
    if (row.date) {
      date = row.date;
    } else if (row.time) {
      date = row.time;
    }
    return (
      <td key="date">
        {date.substring(11, 19) + ' ' + date.substring(0, 10)}
      </td>
    );
  }

  containerRender(row) {
    return (
      <td key="container">
       <Link to={row.container ? "/clusters/" + row.cluster + "/containers/" + row.container.name : ""}>{row.container ? row.container.name : ""}</Link>
      </td>
    );
  }

  clusterRender(row) {
    return (
      <td key="cluster">
        <Link to={row.cluster ? "/clusters/" + row.cluster : ""}>{row.cluster ? row.cluster : ""}</Link>
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
