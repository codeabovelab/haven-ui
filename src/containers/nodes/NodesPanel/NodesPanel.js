import React, {Component, PropTypes} from 'react';
import {load, deleteNode} from 'redux/modules/nodes/nodes';
import {connect} from 'react-redux';
import {ClusterNodesDialog} from '../../../containers/index';
import {DockTable, NodesList, StatisticsPanel} from '../../../components';
import {NodeAdd} from '../../index';
import Helmet from 'react-helmet';

@connect(
  state => ({
    nodes: state.nodes,
    nodesIds: state.nodesUI.list
  }), {load, deleteNode})
export default class NodesPanel extends Component {
  static propTypes = {
    nodes: PropTypes.object,
    params: PropTypes.object,
    nodesIds: PropTypes.array,
    load: PropTypes.func.isRequired,
    deleteNode: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Node Running',
      titles: 'Nodes Running'
    },
    {
      type: 'number',
      title: 'Node Stopped',
      titles: 'Nodes Stopped'
    },
    {
      type: 'number',
      title: 'Node Total',
      titles: 'Nodes Total'

    }
  ];
  componentDidMount() {
    const {load} = this.props;
    load();
    $('.input-search').focus();
  }

  render() {
    const {nodes, nodesIds, params} = this.props;
    let nodesList = nodesIds !== null ? nodesIds.map(id => nodes[id]) : null;
    if (params.name && nodesList) {
      nodesList = nodesList.filter((el)=>(el.cluster === params.name));
    }
    let totalNodes = (nodesList !== null ? nodesList.length : 0);
    let runningNodes = 0;
    let stoppedNodes = 0;

    if (totalNodes > 0) {
      nodesList.forEach((node) => {
        if (node.health != null && node.on === true) {
          runningNodes++;
        } else {
          stoppedNodes++;
        }
      });
    }
    return (
      <div>
        <Helmet title="Nodes"/>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[runningNodes, stoppedNodes, totalNodes]}
        />
        <NodesList loading={nodes.loading}
                   data={nodesList}
                   deleteNode={this.props.deleteNode}
                   loadNodes={this.props.load}
                   clusterName={params.name}
                   manageNodes={this.manageNodes.bind(this)}
        />

        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
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

  manageNodes() {
    this.setState({
      actionDialog: (
        <ClusterNodesDialog title="Manage Cluster Nodes"
                            clusterName={this.props.params.name}
                            onHide={this.onHideDialog.bind(this)}
        />
      )
    });
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }
}
