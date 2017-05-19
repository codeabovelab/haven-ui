import React, {Component, PropTypes} from 'react';
import {AgentGet, AgentAddNode} from '../../components/index';
import {add, load} from '../../redux/modules/nodes/nodes';
import {getAgent} from '../../redux/modules/settings/settings';
import {connect} from 'react-redux';
import {Panel} from 'react-bootstrap';
import Helmet from 'react-helmet';

@connect(
  state => ({
    agent: state.settings.agent
  }), {
    addNode: add,
    loadNodes: load,
    getAgent
  })
export default class AgentPanel extends Component {
  static propTypes = {
    agent: PropTypes.string.isRequired,
    addNode: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
    getAgent: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.props.getAgent();
  }

  render() {
    const css = require('./AgentPanel.scss');

    return (
      <Panel>
        <Helmet title="Agent"/>
        <div className="col-md-offset-1 col-md-10 col-md-offset-1">
          <h3>Get Agent</h3>
          <AgentGet css={css} agent={this.props.agent}/>
          <h3>Add Node</h3>
          <AgentAddNode css={css} addNode={this.props.addNode} loadNodes={this.props.loadNodes}/>
        </div>
      </Panel>
    );
  }
}
