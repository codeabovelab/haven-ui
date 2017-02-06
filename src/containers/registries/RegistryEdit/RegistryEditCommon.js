import React, {PropTypes, Component} from 'react';
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, ButtonToolbar, Button, Checkbox, ButtonGroup} from 'react-bootstrap';

export default class RegistryEditCommon extends Component {
  static propTypes ={
    values: PropTypes.object.isRequired,
    param: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
    firstLoad: PropTypes.bool.isRequired
  };

  renderInput(type, title, placeholder, field, firstLoad) {
    return (
      <FormGroup required title="required" validationState={(field.error &&
      (field.touched || !firstLoad)) ? "error" : null}>
        <ControlLabel>{title}</ControlLabel>
        <FormControl type={type} placeholder={placeholder} {...field} />
      </FormGroup>
    );
  }

  renderLabel(title, field) {
    return (
      <FormGroup>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2} className="pulled-left-col-block">
              <ControlLabel>{title}</ControlLabel>
            </Col>
            <Col sm={7}>
              <ControlLabel> {field.value} </ControlLabel>
            </Col>
          </Row>
        </Grid>
      </FormGroup>
    );
  }

  renderTwoCheckboxes(fields) {
    let space = ' ';
    let buttonDisabledOn = fields.disabled.value ? 'primary' : 'default';
    let buttonDisabledOff = fields.disabled.value ? 'default' : 'primary';
    let buttonReadOn = fields.readOnly.value ? 'primary' : 'default';
    let buttonReadOff = fields.readOnly.value ? 'default' : 'primary';
    return (
      <FormGroup>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2} className="pulled-left-col-block">
              <ButtonGroup>
                <Button
                  onClick={()=>(fields.disabled.onChange(true))}
                  bsStyle={buttonDisabledOn}
                >Disabled</Button>
                <Button
                  onClick={()=>(fields.disabled.onChange(false))}
                  bsStyle={buttonDisabledOff}
                >Enabled</Button>
              </ButtonGroup>
              <br/><br/>
            </Col>
            <Col sm={2}>
              <ButtonGroup>
                <Button
                  onClick={()=>(fields.readOnly.onChange(true))}
                  bsStyle={buttonReadOn}
                >Read Only</Button>
                <Button
                  onClick={()=>(fields.readOnly.onChange(false))}
                  bsStyle={buttonReadOff}
                >Editable</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Grid>
      </FormGroup>
    );
  }

  renderButtonSubmit(valid, okTitle) {
    return (
      <div className="form-group text-right submit-buttons-block">
        <Button bsStyle="primary"
                disabled={!valid}
                type="submit"
        >
          {okTitle}
        </Button>
        <span>&nbsp;&nbsp;</span>
        <Button bsStyle="default"
                onClick={this.props.onHide}
        >
          Cancel
        </Button>
      </div>
    );
  }
}
