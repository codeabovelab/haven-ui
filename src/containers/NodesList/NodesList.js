import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/nodes';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { Link } from 'react-router';
import {bindActionCreators} from 'redux';

@connect(
  state => ({
    nodes: state.nodes.all
  }), dispatch => bindActionCreators({load}, dispatch))
export default class NodesList extends Component {
  static propTypes = {
    nodes: PropTypes.array,
    load: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const {load} = this.props; // eslint-disable-line no-shadow
    load();
  }

  render() {
    const s = require('./NodesList.scss');
    const {nodes} = this.props; // eslint-disable-line no-shadow

    return (
      <div className="container-fluid">
        <div className={s.nodesList}>
          <h1 className="text-xs-center">Node List</h1>
          <div className="text-xs-center">
            Nodes total: <strong>{nodes && nodes.length}</strong>
          </div>
          <div className="pull-xs-right">
            <button className="btn btn-primary" disabled>Add Node</button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
              <tr>
                <th>Node Name</th>
                <th>Internal IP</th>
                <th># of Containers</th>
                <th>Health</th>
                <th># of CPU</th>
                <th>Memory Usage</th>
                <th>Assigned cluster</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {nodes && nodes.map(node =>
                <tr key={node.name}>
                  <td>{node.name}</td>
                  <td>{node.ip}</td>
                  <td>{node.containers.length}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className={s.actions}>
                    <i className="fa fa-trash"></i> | <i className="fa fa-pencil"></i>
                  </td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
