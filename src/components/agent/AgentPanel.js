import React, {Component, PropTypes} from 'react';

export default class AgentPanel extends Component {

  render() {
    let agentURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + "/res/agent/dockmaster-agent.py";
    if (location.hostname === 'localhost') {
      agentURL = "http://hb1.codeabovelab.com/res/agent/dockmaster-agent.py";
    }
    return (
      <div>
        <ul className="breadcrumb">
          <li className="active">Agent</li>
        </ul>
        <div className="agentList">
          <p>Get Agent:
            &nbsp;<a href={agentURL}>{agentURL}</a>
          </p>
        </div>
      </div>
    );
  }
}
