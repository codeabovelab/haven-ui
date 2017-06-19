import React, {Component, PropTypes} from 'react';
import {DockTable} from 'components';
import {Link} from 'react-router';
import {ProgressBar} from 'react-bootstrap';

export default class EventLog extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    data: PropTypes.array,
    statistics: PropTypes.bool
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
      name: 'count',
      label: 'Count',
      sortable: true,
      width: '10%'
    },
    {
      name: 'severity',
      label: 'Severity',
      sortable: true,
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
      sortable: true,
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
    if (!this.props.statistics) {
      this.COLUMNS = this.COLUMNS.filter((object)=> object.name !== 'count');
    }
    return (
      <div>
        {this.props.loading && (
          <ProgressBar active now={100}/>
        )}

        {(this.props.data && !this.props.loading) && (
          <DockTable columns={this.COLUMNS}
                     rows={this.props.data}
                     striped
                     searchable={false}
          />
        )}
        {(this.props.data && this.props.data.length === 0) && (
          <div className="alert alert-no-results">
            No events yet
          </div>
        )}
      </div>
    );
  }
}
