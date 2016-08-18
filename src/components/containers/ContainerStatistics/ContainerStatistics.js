import React, {Component, PropTypes} from 'react';
import {loadStatistics} from 'redux/modules/containers/containers';
import {Dialog, PropertyGrid} from 'components';
import {Row, Col, FormGroup, FormControl, Checkbox, ControlLabel, HelpBlock} from 'react-bootstrap';
import {connect} from 'react-redux';
import _ from 'lodash';

@connect(
  state => ({
    containers: state.containers,
    containersUI: state.containersUI
  }),
  {loadStatistics})
export default class ContainerStatistics extends Component {
  static propTypes = {
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    loadStatistics: PropTypes.func.isRequired,

    onHide: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {container, loadStatistics} = this.props;
    loadStatistics(container);
  }

  render() {
    let s = require('./ContainerStatistics.scss');
    const {container, containers, containersUI} = this.props;
    let containerDetailed = containers[container.id];
    let loadingStatistics = _.get(containersUI, `[${container.id}].loadingStatistics`, false);
    let stats = containerDetailed.statistics ? containerDetailed.statistics : {};

    //
    // TODO: Refactor dialog layout using property grid
    //

    return (
      <Dialog show
              hideCancel
              size="large"
              title={`Container Statistics: ${container.name}`}
              okTitle="Close"
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
      >
        {loadingStatistics && (
          <div className="text-xs-center">
            <i className="fa fa-spinner fa-5x fa-pulse"/>
          </div>
        )}

        {!loadingStatistics && (
          <div className="data jumbotron-text">
            <PropertyGrid data={stats}
            />
          </div>
        )}
      </Dialog>
    );
  }

  printNetworks(networks) {
    const fields = {
      rx_bytes: {label: 'Rx KBytes'},
      rx_packets: {label: 'Rx Packets'},
      rx_errors: {label: 'Rx Errors'},
      rx_dropped: {label: 'Rx Dropped'},
      tx_bytes: {label: 'Tx KBytes'},
      tx_packets: {label: 'Tx Packets'},
      tx_errors: {label: 'Tx Errors'},
      tx_dropped: {label: 'Tx Dropped'}
    };
    let fieldsNames = Object.keys(fields);

    let els = [];
    _.forOwn(networks, (network, name) => {
      let values = prepareValues(network);
      let el = (
        <div className="network" key={name}>
          <h6>{name}</h6>
          <div>
            {fieldsNames.map(fieldName => <div key={fieldName}><label>{fieldLabel(fieldName)}:</label> {values[fieldName]}</div>)}
          </div>
        </div>
      );
      els.push(el);
    });
    return <div>{els}</div>;

    function fieldLabel(name) {
      return _.get(fields, `${name}.label`, name);
    }

    function prepareValues(net) {
      let network = Object.assign({}, net);
      if (network.rx_bytes) {
        network.rx_bytes = Math.round(network.rx_bytes / 1024);
      }
      if (network.tx_bytes) {
        network.tx_bytes = Math.round(network.tx_bytes / 1024);
      }
      return network;
    }
  }

}
