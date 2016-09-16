import React, {PropTypes, Component} from 'react';
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, ButtonToolbar, Button, Checkbox, ButtonGroup} from 'react-bootstrap';

export default class RegistryEditCommon extends Component {
  static propTypes ={
    values: PropTypes.object.isRequired,
    param: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired
  };

  renderInput(type, title, placeholder, field) {
    return (
      <FormGroup validationState={(field.error && field.touched) ? "error" : "warning"}>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2}>
              <ControlLabel>{title}</ControlLabel>
            </Col>
            <Col sm={7}>
              <FormControl type={type} placeholder={placeholder} {...field} />
            </Col>
          </Row>
        </Grid>
      </FormGroup>
    );
  }

  renderLabel(title, field) {
    return (
      <FormGroup>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2}>
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
    let buttonDisabledOn = fields.disabled.value ? 'info' : 'default';
    let buttonDisabledOff = fields.disabled.value ? 'default' : 'info';
    let buttonReadOn = fields.readOnly.value ? 'info' : 'default';
    let buttonReadOff = fields.readOnly.value ? 'default' : 'info';
    return (
      <FormGroup>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2}>
              {space}
            </Col>
            <Col sm={3}>
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
            <Col sm={4}>
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

  renderButtonSubmit(valid) {
    return (
      <ButtonToolbar>
        <Button bsSize="large"
                bsStyle="info"
                disabled={!valid}
                type="submit"
        >
          Submit
        </Button>
        <Button bsSize="large"
                bsStyle="info"
                onClick={this.props.onHide}
        >
          Cancel
        </Button>

      </ButtonToolbar>
    );
  }
}
