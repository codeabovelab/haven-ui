import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/nodes/nodes';
import {connect} from 'react-redux';
import {DockTable, NodesList, StatisticsPanel} from '../../../components';
import {NodeAdd} from '../../index';
import {ButtonToolbar, SplitButton, Button, MenuItem} from 'react-bootstrap';

@connect(
  state => ({
    nodes: state.nodes,
    nodesIds: state.nodesUI.list
  }), {load})
export default class NodesPanel extends Component {
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

        <NodesList loading={typeof nodesList === "undefined"}
                    data={nodesList}
                    onAddNode={this.addNode.bind()}
        />
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
