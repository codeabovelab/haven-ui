import React, {PropTypes, Component} from 'react';
import {Grid, Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, ButtonToolbar, Button, HelpBlock, Thumbnail} from 'react-bootstrap';

export default class RegistryEditCommon extends Component {

  renderInput(type, fieldName, title, placeholder, fields) {
    return (
      <FormGroup validationState={(fields[fieldName].error && fields[fieldName].touched) ? "error" : "warning"}>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2}>
              <ControlLabel>{title}</ControlLabel>
            </Col>
            <Col sm={7}>
              <FormControl type={type} placeholder={placeholder} {...fields[fieldName]} />
            </Col>
          </Row>
        </Grid>
      </FormGroup>
    );
  }

  renderLabel(fieldName, title, fields) {
    return (
      <FormGroup>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2}>
              <ControlLabel>{title}</ControlLabel>
            </Col>
            <Col sm={7}>
              <ControlLabel> {fields[fieldName].value} </ControlLabel>
            </Col>
          </Row>
        </Grid>
      </FormGroup>
    );
  }

  renderTwoCheckboxes(fields) {
    return (
      <FormGroup>
        <Grid>
          <Row slassName="show-grid">
            <Col sm={2}>
              --
            </Col>
            <Col sm={2}>
              <Checkbox inline {...fields.disabled}>
                Disabled
              </Checkbox>
            </Col>
            <Col sm={2}>
              <Checkbox inline {...fields.readOnly}>
                Read Only
              </Checkbox>
            </Col>
          </Row>
        </Grid>
      </FormGroup>
    );
  }
}
