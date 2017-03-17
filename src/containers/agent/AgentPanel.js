import React, {Component, PropTypes} from 'react';
import {AgentGet, AgentAddNode} from '../../components/index';
import {add, load} from '../../redux/modules/nodes/nodes';
import {connect} from 'react-redux';
import {Panel} from 'react-bootstrap';

@connect(
  state => ({}), {
    addNode: add,
    loadNodes: load
  })
export default class AgentPanel extends Component {
  static propTypes = {
    addNode: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired
  };

  render() {
    const css = require('./AgentPanel.scss');

    return (
      <Panel>
        <div className="col-md-offset-1 col-md-10 col-md-offset-1">
          <h3>Get Agent</h3>
          <AgentGet css={css}/>
          <h3>Add Node</h3>
          <AgentAddNode css={css} addNode={this.props.addNode} loadNodes={this.props.loadNodes}/>
        </div>
      </Panel>
    );
  }
}
