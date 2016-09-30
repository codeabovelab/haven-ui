import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {PropertyGrid} from '../index';
import {load} from 'redux/modules/nodes/nodes';

@connect(
  state => ({
    nodes: state.nodes
  }), {load})
export default class NodeInfo extends Component {
  static propTypes = {
    node: PropTypes.string.isRequired,
    nodes: PropTypes.object.isRequired,
    load: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.load();
  }

  render() {
    let node = this.props.node;
    let data = {...this.props.nodes[node]};
    data.state = (data.health && data.health.state) || "";
    delete data.health;
    return (<PropertyGrid data={data} />);
  }
}
