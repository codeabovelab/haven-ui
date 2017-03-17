import React, {Component, PropTypes} from 'react';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Button} from 'react-bootstrap';
import {createValidator, required, ipWithPort} from 'utils/validation';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {LoadingDialog} from '../index';

@reduxForm({
  form: 'AddNode',
  fields: [
    'nodeTitle',
    'nodeAddress'
  ],
  validate: createValidator({
    nodeTitle: [required],
    nodeAddress: [ipWithPort],
  })
})
export default class AgentAddNode extends Component {

  static propTypes = {
    fields: PropTypes.object,
    css: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    addNode: PropTypes.func.isRequired,
    loadNodes: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = {
      actionDialog: undefined
    };
  }

  onSubmit() {
    const {fields, addNode} = this.props;
    this.setState({
      actionDialog: (
        <LoadingDialog entityType="node"
                       node={{name: fields.nodeTitle.value, address: fields.nodeAddress.value}}
                       onHide={this.onHideDialog.bind(this)}
                       name=""
                       longTermAction={addNode}
                       refreshData={this.props.loadNodes}
                       actionKey="created"
        />
      )
    }).catch(()=>null);
  }

  render() {
    const css = this.props.css;
    const fields = this.props.fields;

    return (
      <div className="row">
        <form>
          <div className="col-md-5 col-sm-12">
            <FormGroup validationState={fields.nodeTitle.error && fields.nodeTitle.touched ? "error" : null}>
              <ControlLabel>Node Name</ControlLabel>
              <FormControl type="text"
                           {...fields.nodeTitle}
                           placeholder="node's name"
              />
              {(fields.nodeTitle.error && fields.nodeTitle.touched) && (
                <HelpBlock>{fields.nodeTitle.error}</HelpBlock>
              )}
            </FormGroup>
          </div>
          <div className="col-md-5 col-sm-12">
            <FormGroup validationState={fields.nodeAddress.error && fields.nodeAddress.touched ? "error" : null}>
              <ControlLabel>Node Address</ControlLabel>
              <FormControl type="text"
                           {...fields.nodeAddress}
                           placeholder="123.45.67.89:2375"
              />
              {(fields.nodeAddress.error && fields.nodeAddress.touched) && (
                <HelpBlock>{fields.nodeAddress.error}</HelpBlock>
              )}
            </FormGroup>
          </div>
          <div className="col-md-2 col-sm-12">
            <Button
              className={css.buttonLink}
              onClick={this.onSubmit.bind(this)}
              bsStyle="primary"
              disabled={fields.nodeTitle.error || fields.nodeAddress.error}
              >Add Node</Button>
          </div>
        </form>
        {(this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }
}

