import React, {Component, PropTypes} from 'react';
import {FormGroup, ControlLabel, Button} from 'react-bootstrap';

export default class AgentGet extends Component {

  static propTypes = {
    agent: PropTypes.string.isRequired
  };

  copyToClipboard() {
    const agent = this.props.agent;
    if (agent && agent.length !== 0) {
      this.agentInput.select();
      try {
        let successful = document.execCommand('copy');
        let msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
      } catch (err) {
        console.log('Oops, unable to copy. Try to copy command manually');
      }
    }
  }

  render() {
    const agent = this.props.agent;

    return (
      <div className="row">
        <div className="col-md-10 col-sm-12">
          <form>
            <FormGroup>
              <ControlLabel>Get Agent Command</ControlLabel>
              <input type="string"
                     ref={(input) => {
                       this.agentInput = input;
                     }}
                     className="form-control"
                     readOnly
                     value={agent}/>
            </FormGroup>
          </form>
        </div>
        <div className="col-md-2 col-sm-12">
          <Button
            className="btn btn-primary buttonLink"
            type="button"
            disabled={!!(!agent || agent.length === 0)}
            onClick={this.copyToClipboard.bind(this)}
            >Copy To Clipboard</Button>
        </div>
      </div>
    );
  }
}
