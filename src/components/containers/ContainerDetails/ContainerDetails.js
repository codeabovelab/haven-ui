import React, {Component, PropTypes} from 'react';
import {loadDetails} from 'redux/modules/containers/containers';
import {Dialog} from 'components';
import {Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock} from 'react-bootstrap';
import {connect} from 'react-redux';
import _ from 'lodash';

@connect(
  state => ({
    containers: state.containers,
    containersUI: state.containersUI
  }),
  {loadDetails})
export default class ContainerDetails extends Component {
  static propTypes = {
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    loadDetails: PropTypes.func.isRequired,

    onHide: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {container, loadDetails} = this.props;
    loadDetails(container);
  }

  render() {
    let s = require('./ContainerDetails.scss');
    const {container, containers, containersUI} = this.props;
    let containerDetailed = containers[container.id];
    let loadingDetails = _.get(containersUI, `[${container.id}].loadingDetails`, false);
    let details = containerDetailed.details;
    let properties = details ? Object.keys(details) : [];
    return (
      <Dialog show
              hideCancel
              size="large"
              title={`Container Details: ${container.name}`}
              okTitle="Close"
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
      >
        {loadingDetails && (
          <div className="text-xs-center">
            <i className="fa fa-spinner fa-5x fa-pulse"/>
          </div>
        )}

        {!loadingDetails && (
          <div className="jumbotron-text">
            {properties.map(propertyToHTML)}
          </div>
        )}
      </Dialog>
    );

    function propertyToString(propertyName, property) {
      let out = '';
      if (property instanceof Array) {
        switch (propertyName.toLowerCase()) {
          case 'args':
            out = property.join(' ');
            break;
          default:
            out = property.join(', ');
        }
      } else if (property instanceof Object) {
        out = JSON.stringify(property);
      } else out = property;

      return out;
    }

    function propertyToHTML(propertyName) {
      let property = details[propertyName];
      let out = propertyToString(propertyName, property);
      return (
        <div key={propertyName}>
          <h5>{propertyName}:</h5>
          <span>{out}</span>
        </div>
      );
    }
  }
}
