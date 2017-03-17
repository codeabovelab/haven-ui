import React, {Component, PropTypes} from 'react';
import config from '../../config';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Button} from 'react-bootstrap';
import {createValidator, required, ipOrEmpty} from 'utils/validation';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {isEmpty} from '../../utils/validation';

@reduxForm({
  form: 'GetAgent',
  fields: [
    'nodeIp'
  ],
  validate: createValidator({
    nodeIp: [ipOrEmpty],
  })
})
export default class AgentGet extends Component {

  static propTypes = {
    fields: PropTypes.object,
    css: PropTypes.object.isRequired
  };

  render() {
    const css = this.props.css;
    const fields = this.props.fields;
    const nodeIpEmpty = isEmpty(fields.nodeIp.value);
    let agentURL = location.protocol + '//' + config.apiHost + "/discovery/agent/haven-agent.py";
    if (!nodeIpEmpty) {
      agentURL += "?node=" + fields.nodeIp.value + ":2375";
    }

    return (
      <div className="row">
        <div className="col-md-4 col-sm-12">
          <form onSubmit={this.handleSubmit}>
            <FormGroup validationState={fields.nodeIp.error ? "error" : null}>
              <ControlLabel>Node IP</ControlLabel>
              <FormControl type="text"
                           {...fields.nodeIp}
                           placeholder="node's ip address (can be skipped)"
              />
              {fields.nodeIp.error && (
                <HelpBlock>{fields.nodeIp.error}</HelpBlock>
              )}
            </FormGroup>
          </form>
        </div>
        <div className="col-md-3 col-sm-12">
          <Button
            className={"btn btn-primary " + css.buttonLink}
            type="button"
            disabled={fields.nodeIp.error}
            href={agentURL}>Get Agent</Button>
        </div>
      </div>
    );
  }
}
