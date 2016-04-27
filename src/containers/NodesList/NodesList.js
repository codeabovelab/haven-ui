import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/nodes/nodes';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { Link } from 'react-router';
import {bindActionCreators} from 'redux';

@connect(
  state => ({
    nodes: state.nodes,
    nodesIds: state.nodesUI.list
  }), dispatch => bindActionCreators({load}, dispatch))
export default class NodesList extends Component {
  static propTypes = {
    nodes: PropTypes.object,
    nodesIds: PropTypes.array,
    load: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {load} = this.props;
    load();
  }

  render() {
    const s = require('./NodesList.scss');
    const {nodes, nodesIds} = this.props;
    const nodesList = nodesIds !== null ? nodesIds.map(id => nodes[id]) : null;

    return (
      <div className="container-fluid">
        <div className={s.nodesList}>
          <h1>Node List</h1>
          <div className="page-info-group">
            <div>
              <label>
                # of Nodes:
              </label>
              <value>
                {nodesList && nodesList.length}
              </value>
            </div>
          </div>
          <div className="page-actions">
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
              {nodesList && nodesList.map(node =>
                <tr key={node.name}>
                  <td>{node.name}</td>
                  <td>{node.ip}</td>
                  <td>{node.containers.length}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className={s.actions}>
                    <i className="fa fa-trash"/> | <i className="fa fa-pencil"/>
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
