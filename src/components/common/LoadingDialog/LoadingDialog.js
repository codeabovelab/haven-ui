import React, {Component, PropTypes} from 'react';
import * as containerActions from 'redux/modules/containers/containers';
import {Dialog} from 'components';
import {Alert} from 'react-bootstrap';
import {connect} from 'react-redux';

@connect(
  state => ({
    containers: state.containers,
    containersUI: state.containersUI
  }),
  containerActions)
export default class LoadingDialog extends Component {
  static propTypes = {
    containers: PropTypes.object,
    containersUI: PropTypes.object,
    container: PropTypes.object,
    application: PropTypes.object,
    network: PropTypes.object,
    name: PropTypes.string.isRequired,
    entityType: PropTypes.string.isRequired,
    actionKey: PropTypes.string.isRequired,
    longTermAction: PropTypes.func.isRequired,
    refreshData: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  };

  constructor() {
    super();
    this.state = {
      longTermActionResponse: ''
    };
  }

  componentDidMount() {
    let result;
    let funcRequest;
    const {container, name, longTermAction, application, network, refreshData, entityType} = this.props;
    if (entityType === 'network') {
      funcRequest = longTermAction(name, network.id, container);
    } else if (entityType === 'application') {
      funcRequest = longTermAction(name, application.name);
    } else if (entityType === 'container') {
      funcRequest = longTermAction(container);
    }
    funcRequest.catch((response) =>{
      this.setState({
        longTermActionResponse: response
      });
    })
      .then((response) => {
        refreshData(name);
        result = response === null ? 'Action has no effect' : response._res;
        this.setState({
          longTermActionResponse: result
        });
      }).catch(() => null);
  }

  componentWillUpdate(nextProps, nextState) {
    let message = '';
    let $actionResponse = $('#actionResponse');
    const {actionKey, entityType} = this.props;
    let entity = this.props[entityType];
    const status = nextState.longTermActionResponse.status || nextState.longTermActionResponse.code;
    if (status) {
      switch (status) {
        case 200:
          message = entityType + " \"" + entity.name + "\"" + ' successfully ' + actionKey;
          break;
        case 304:
          message = entityType + " \"" + entity.name + "\"" + ' was not modified';
          break;
        default:
          message = 'Error: ' + nextState.longTermActionResponse.message;
      }
    }
    $actionResponse.find('div').text(message);
  }

  render() {
    const {entityType} = this.props;
    let error;
    let title = capitalize(entityType) + ' "' + this.props[entityType].name + '"';
    let s = require('./LoadingDialog.scss');
    let response = this.state.longTermActionResponse;
    response = response === undefined ? '' : response;
    if (response) {
      const status = response.status || response.code;
      error = (status !== 200 && status !== 304) ? response.message : '';
    }

    return (
      <Dialog show
              hideCancel
              size="large"
              title={title}
              okTitle="Close"
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
      >
        {!response && (
          <div className={s["loading-box"]}>
            <span className={s["loading-icon"]}><i className="fa fa-spinner fa-5x fa-pulse"/>&nbsp;</span>
            <span className={s["loading-text"]}>Perfoming Action...</span>
          </div>
        )}
        {error && (
          <Alert bsStyle="danger">
            {error}
          </Alert>
        )}
        {!error && (
          <div
            className={s["loading-dialog"]}
            defaultValue=""
            id="actionResponse"
          >
            <div className={s.message}></div>
          </div>
        )}
      </Dialog>
    );
  }
}

function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}
