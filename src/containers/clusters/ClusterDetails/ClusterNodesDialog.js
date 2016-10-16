import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog} from 'components';
import {reduxForm, SubmissionError} from 'redux-form';
import {load as loadAllNodes, create as createNode, remove as removeNode} from 'redux/modules/nodes/nodes';
import {loadNodesDetailed} from 'redux/modules/clusters/clusters';
import {Alert, Panel, Label, FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';

@connect(state => ({
  nodes: state.nodes
}), {loadAllNodes, createNode, removeNode, loadNodesDetailed})
@reduxForm({
  form: 'ManageNodes',
  fields: [
    'assignedNodes'
  ]
})
export default class ClusterNodesDialog extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    cluster: PropTypes.object.isRequired,
    nodes: PropTypes.object,
    createError: PropTypes.string,
    handleSubmit: PropTypes.func,
    fields: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    loadAllNodes: PropTypes.func.isRequired,
    loadNodesDetailed: PropTypes.func.isRequired,
    createNode: PropTypes.func.isRequired,
    removeNode: PropTypes.func.isRequired
  };
  static focusSelector = '#node-select';

  componentWillMount() {
    const {loadAllNodes, loadNodesDetailed, cluster} = this.props;
    this.state = {
      selectMenuVisible: false,
      assignedNodes: cluster.nodesListDetailed
    };
    loadNodesDetailed(cluster.name);
    loadAllNodes();
  }

  render() {
    require('react-select/dist/react-select.css');
    const selectMenuVisible = this.state.selectMenuVisible;
    return (
      <Dialog show
              size="large"
              title={this.props.title}
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
              keyboard={!selectMenuVisible}
      >
        {this.props.createError && (
          <Alert bsStyle="danger">
            {this.props.createError}
          </Alert>
        )}

        <form>
          <div className="form-group">
            <label>Assigned Nodes</label>
            <Select ref="nodeSelect"
                    className="nodeSelect"
                    placeholder = "Type to filter for node"
                    autoFocus
                    multi
                    clearable
                    onOpen={this.onSelectMenuOpen.bind(this)}
                    onClose={this.onSelectMenuClose.bind(this)}
                    onChange={this.handleSelectChange.bind(this)}
                    name="assignedNodes"
                    value={this.state.assignedNodes}
                    labelKey="name"
                    valueKey="name"
                    options={this.getNodeOptions()}
                    searchable />
          </div>
        </form>
      </Dialog>
    );
  }

  handleSelectChange(value) {
    const {fields} = this.props;
    this.setState({
      assignedNodes: value
    });
    fields.assignedNodes.onChange(value);
  }

  onSubmit() {
    const {cluster, createNode, removeNode, loadNodesDetailed, onHide} = this.props;
    let promises = [];
    let prevNodes = cluster.nodesListDetailed;
    let newNodes = this.state.assignedNodes;
    _.differenceBy(newNodes, prevNodes, 'name').map(node => {
      promises.push(createNode({name: node.name, cluster: cluster.name}));
    });
    _.differenceBy(prevNodes, newNodes, 'name').map(node => {
      promises.push(removeNode({name: node.name, cluster: cluster.name}));
    });

    Promise.all(promises)
      .then(() => {
        window.setTimeout(() => { loadNodesDetailed(cluster.name); }, 10000); //?? with a lesser timeout the server doesn't return an updated list
      })
      .then(() => {
        onHide();
      })
      .catch((exeption) => {
        console.log('promise.all Exeption', exeption);
      });
  }

  getNodeOptions() {
    const {nodes} = this.props;
    let nodeOptions;
    nodeOptions = nodes && Object.keys(nodes).map((k) => {
      return nodes[k];
    });
    return nodeOptions;
  }


  onSelectMenuOpen() {
    this.setState({
      selectMenuVisible: true
    });
  }

  onSelectMenuClose() {
    setTimeout(function changeMenuState() {
      this.setState({selectMenuVisible: false});
    }.bind(this), 100);
  }

}
