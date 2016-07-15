import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/nodes/nodes';
import {connect} from 'react-redux';
import NodeAdd from '../NodeAdd/NodeAdd';
import {DockTable} from '../../../components/index';

const COLUMNS = [
  {name: 'name', label: 'Node Name'},
  {name: 'ip', label: 'Internal IP'},
  {name: 'containers', label: '# of Containers'},
  {name: 'health'},
  {name: 'cpu', label: '# of CPU'},
  {name: 'memory', label: 'Memory Usage'},
  {name: 'cluster', label: 'Assigned Cluster'},
  {name: 'actions', render: actionsRender}
];

COLUMNS.forEach(column => column.sortable = column.name !== 'actions');

@connect(
  state => ({
    nodes: state.nodes,
    nodesIds: state.nodesUI.list
  }), {load})
export default class NodesList extends Component {
  static propTypes = {
    nodes: PropTypes.object,
    nodesIds: PropTypes.array,
    load: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {load} = this.props;
    load();
    $('.input-search').focus();
  }

  render() {
    const {nodes, nodesIds} = this.props;
    const nodesList = nodesIds !== null ? nodesIds.map(id => nodes[id]) : null;

    return (
      <div className="panel">
        <div className="panel-body">
          <div className="panel-content">
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
              <button className="btn btn-primary"
                      onClick={this.addNode.bind(this)}>
                <i className="fa fa-plus" />
                Add Node
              </button>
            </div>

            <div className="clearfix"></div>

            {nodesList && (
              <DockTable columns={COLUMNS} rows={nodesList} />
            )}
        </div>
      </div>
    </div>
    );
  }

  addNode() {
    let contentComponent = <NodeAdd/>;
    window.simpleModal.show({
      contentComponent,
      focus: NodeAdd.focusSelector
    });
  }
}

function actionsRender() {
  return (
    <td key="actions" className="td-actions">
      <i className="fa fa-pencil" disabled/> | <i className="fa fa-trash" disabled/>
    </td>
  );
}
