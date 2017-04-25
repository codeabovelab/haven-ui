import React, {Component, PropTypes} from 'react';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import {connect} from 'react-redux';
import {scale as scaleContainer} from 'redux/modules/containers/containers';
import {getClusterServices, scaleService} from 'redux/modules/services/services';
import {loadContainers} from 'redux/modules/clusters/clusters';
import _ from 'lodash';
import {isInt} from 'utils/validation';

@connect(state => ({
  containersUI: state.containersUI,
  services: state.services
}), {scaleContainer, loadContainers, scaleService, getClusterServices})
export default class ContainerScale extends Component {
  static propTypes = {
    containersUI: PropTypes.object,
    container: PropTypes.object,
    services: PropTypes.object,
    service: PropTypes.object,
    scaleContainer: PropTypes.func.isRequired,
    scaleService: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,
    getClusterServices: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired
  };
  static focusSelector = '#instances-number';

  constructor(...params) {
    super(...params);
    this.state = {scaleFactor: 1};
  }

  componentWillMount() {
    const replicas = _.get(this.props.service, 'mode.replicas', false);
    if (isInt(replicas)) {
      this.setState({
        scaleFactor: replicas
      });
    }
  }

  onSubmit() {
    if (this.props.container) {
      this.scaleContainer();
    } else {
      this.scaleService();
    }
  }

  handleChange(e) {
    this.setState({scaleFactor: e.target.value});
  }

  render() {
    const {container, containersUI, service, services, name} = this.props;
    let scaling = container ? _.get(containersUI, `[${container.id}].scaling`, false) :
      _.get(services, `${name}.${service.id}.scaling`, false);
    let scaleTitle = container ? `Scale Container: ${container.name}` : `Scale Service: ${service.name}`;

    return (
      <Dialog show
              size="large"
              title={scaleTitle}
              onSubmit={this.onSubmit.bind(this)}
              onHide={this.props.onHide}
              cancelTitle="Close"
      >
        {scaling && (
          <span>{' '}<i className="fa fa-spinner fa fa-pulse"/></span>
        )}

        <FormGroup onChange={this.handleChange.bind(this)}>
          <ControlLabel>Number of instances to be launched:</ControlLabel>
          <FormControl type="number" step="1" min="1" id={ContainerScale.focusSelector.replace('#', '')}
                       defaultValue={this.state.scaleFactor}
          />
        </FormGroup>
      </Dialog>
    );
  }

  scaleContainer() {
    const {container, scaleContainer, loadContainers, name} = this.props;
    return scaleContainer(container, this.state.scaleFactor).then(()=>loadContainers(name).then(()=>this.props.onHide())).catch();
  }

  scaleService() {
    const {service, scaleService, getClusterServices, name} = this.props;
    return scaleService(service, name, this.state.scaleFactor).then(()=>getClusterServices(name).then(()=>this.props.onHide())).catch();
  }
}
