import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog} from 'components';
import Select from 'react-select';
import {load as loadAllNodes, create as createNode, remove as removeNode} from 'redux/modules/nodes/nodes';
import _ from 'lodash';

@connect(state => ({
  nodes: state.nodes
}), {loadAllNodes, createNode, removeNode})
export default class ClusterNodesDialog extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    clusterName: PropTypes.string.isRequired,
    nodes: PropTypes.object,
    onHide: PropTypes.func.isRequired,
    loadAllNodes: PropTypes.func.isRequired,
    createNode: PropTypes.func.isRequired,
    removeNode: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {loadAllNodes} = this.props;
    loadAllNodes();

    let assignedNodes = this.getClusterNodes();
    this.state = {
      assignedNodes: assignedNodes
    };
  }

  render() {
    require('react-select/dist/react-select.css');
    //load some custom styles for node picker (note using a global scoped classes there)
    require('css/theme/component-overrides/react-select.scss');
    return (
      <Dialog show
              size="large"
              title={this.props.title}
              onSubmit={this.onSubmit.bind(this)}
              onHide={this.props.onHide}
      >

        <form>
          <div className="form-group">
            <label>Assigned Nodes</label>
            <Select ref="nodeSelect"
                    className="nodeSelect"
                    placeholder = "Type to filter for node"
                    autoFocus
                    multi
                    clearable
                    onChange={this.handleSelectChange.bind(this)}
                    name="assignedNodes"
                    value={this.state.assignedNodes}
                    labelKey="name"
                    valueKey="name"
                    options={this.getAvailableNodes()}
                    searchable />
          </div>
        </form>
      </Dialog>
    );
  }

  getAllNodes() {
    const {nodes} = this.props;
    return nodes &&
      Object.keys(nodes).map((k) => {
        return {
          ...nodes[k],
          className: nodes[k].health && nodes[k].health.healthy ? 'Select-value-success' : 'Select-value-warning'
        };
      });
  }

  getClusterNodes() {
    const {clusterName} = this.props;
    let allNodes = this.getAllNodes();
    return allNodes && allNodes.filter(node => { return node.cluster === clusterName; });
  }

  getAvailableNodes() {
    const {clusterName} = this.props;
    let allNodes = this.getAllNodes();
    return allNodes && allNodes.filter(node => { return !node.cluster || node.cluster === clusterName; });
  }

  handleSelectChange(value) {
    this.setState({
      assignedNodes: value
    });
  }

  onSubmit() {
    const {clusterName, createNode, removeNode, loadAllNodes, onHide} = this.props;
    let nodeChanges = [];
    let prevNodes = this.getClusterNodes();
    let newNodes = this.state.assignedNodes;
    _.differenceBy(newNodes, prevNodes, 'name').map(node => {
      nodeChanges.push(createNode({name: node.name, cluster: clusterName}));
    });
    _.differenceBy(prevNodes, newNodes, 'name').map(node => {
      nodeChanges.push(removeNode({name: node.name, cluster: clusterName}));
    });

    Promise.all(nodeChanges).then(loadAllNodes)
      .then(() => {
        onHide();
      })
      .catch((exeption) => {
        console.log('promise.all Exeption', exeption);
      });
  }

}
