import React, {Component, PropTypes} from 'react';
import {AgentGet, AgentAddNode} from '../../components/index';
import {add} from '../../redux/modules/nodes/nodes';
import {connect} from 'react-redux';

@connect(
  state => ({}), {
    addNode: add
  })
export default class AgentPanel extends Component {
  static propTypes = {
    addNode: PropTypes.func.isRequired
  };

  render() {
    const css = require('./AgentPanel.scss');

    return (
      <div>
        <AgentGet css={css}/>
        <AgentAddNode css={css} addNode={this.props.addNode}/>
      </div>
    );
  }
}
