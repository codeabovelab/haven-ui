import React, {Component, PropTypes} from 'react';

export default class AgentPanel extends Component {

  render() {
    return (
      <div>
        <ul className="breadcrumb">
          <li className="active">Agent</li>
        </ul>
        <div className="agentList">
          <p>Get Agent:
            &nbsp;<a href="http://hb1.codeabovelab.com/res/agent/dockmaster-agent.py">http://hb1.codeabovelab.com/res/agent/dockmaster-agent.py</a>
          </p>
        </div>
      </div>
    );
  }
}
