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
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    container: PropTypes.object,
    application: PropTypes.object,
    name: PropTypes.string.isRequired,
    actionKey: PropTypes.string.isRequired,
    longTermAction: PropTypes.func.isRequired,
    loadContainers: PropTypes.func,
    listApps: PropTypes.func,
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
    const {container, name, longTermAction, application, loadContainers, listApps} = this.props;
    let funcRequest = application ? longTermAction(name, application.name) : longTermAction(container);
    funcRequest.catch((response) =>{
      this.setState({
        longTermActionResponse: response
      });
    })
      .then((response) => {
        let refreshData = application ? listApps(name) : loadContainers(name);
        result = response === null ? 'Action has no effect' : response._res;
        this.setState({
          longTermActionResponse: result
        });
      }).catch(() => null);
  }

  componentWillUpdate(nextProps, nextState) {
    let message;
    let $actionResponse = $('#actionResponse');
    const {actionKey, container, application} = this.props;
    let entity = container ? container : application;
    let entityType = container ? 'Container ' : 'Application ';
    const status = nextState.longTermActionResponse.status || nextState.longTermActionResponse.code;
    switch (status) {
      case 200:
        message = entityType + "\"" + entity.name + "\"" + ' successfully ' + actionKey;
        if (actionKey === 'returned init file') {
          $actionResponse.find('a').text('Download').attr('href', nextState.longTermActionResponse.xhr.responseURL);
        }
        break;
      case 304:
        message = entityType + "\"" + entity.name + "\"" + ' was not modified';
        break;
      default:
        message = 'Error: ' + nextState.longTermActionResponse.message;
    }
    $actionResponse.find('div').text(message);
  }

  render() {
    const {container, application} = this.props;
    let error;
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
              title={ container ? "Container " + "\"" + container.name + "\"" : "Application " + "\"" + application.name + "\""}
              okTitle="Close"
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
      >
        {!response && (
          <div className="text-xs-center">
            <i className="fa fa-spinner fa-5x fa-pulse"/>
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
            <div></div>
            <a>&nbsp;</a>
          </div>
        )}
      </Dialog>
    );
  }
}
