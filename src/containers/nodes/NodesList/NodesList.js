import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/nodes/nodes';
import {connect} from 'react-redux';
import NodeAdd from '../NodeAdd/NodeAdd';
import {DockTable, StatisticsPanel} from '../../../components/index';
import {ButtonToolbar, SplitButton, Button, MenuItem} from 'react-bootstrap';

const COLUMNS = [
  {
    name: 'name',
    label: 'Name',
    width: '20%',
    sortable: true
  },
  {
    name: 'address',
    label: 'Address',
    width: '20%',
    sortable: true
  },
  {
    name: 'health',
    label: 'Health Status',
    width: '40%'
  },
  {
    name: 'Actions',
    width: '20%',
    render: actionsRender
  }
];

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

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Nodes Running'
    },
    {
      type: 'number',
      title: 'Nodes Stopped'
    },
    {
      type: 'number',
      title: 'Nodes Total'
    }
  ];
  componentDidMount() {
    const {load} = this.props;
    load();
    $('.input-search').focus();
  }

  render() {
    const {nodes, nodesIds} = this.props;
    const nodesList = nodesIds !== null ? nodesIds.map(id => nodes[id]) : null;
    console.log(nodes);
    let totalNodes = (nodesList !== null ? nodesList.length : 0);
    let runningNodes = 0;
    let stoppedNodes = 0;

    if (totalNodes > 0) {
      nodesList.forEach((node) => {
        if (node.health != null) {
          runningNodes++;
        } else {
          stoppedNodes++;
        }
      });
    }
    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics}
        values={[runningNodes, stoppedNodes, totalNodes]}
        />
        <div className="panel">
          <div className="panel-body">
            <div className="panel-content">
              <ButtonToolbar className="page-actions">
                <Button bsStyle="primary"
                        onClick={this.addNode.bind(this)}>
                  <i className="fa fa-plus" />
                  Add Node
                </Button>
              </ButtonToolbar>

              <div className="clearfix"></div>

              {nodesList && (
                <DockTable columns={COLUMNS}
                           rows={nodesList}
                />
              )}
          </div>
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
      <ButtonToolbar>
        <SplitButton bsStyle="info"
                     title="Edit">

          <MenuItem eventKey="1">Edit</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="2">Delete</MenuItem>

        </SplitButton>
      </ButtonToolbar>
    </td>
  );
}
