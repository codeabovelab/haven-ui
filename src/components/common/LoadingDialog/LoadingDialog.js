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
    container: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    actionKey: PropTypes.string.isRequired,
    longTermAction: PropTypes.func.isRequired,
    loadContainers: PropTypes.func.isRequired,

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
    const {container, name, longTermAction} = this.props;
    longTermAction(container).catch((response) =>{
      this.setState({
        longTermActionResponse: response
      });
    })
      .then((response) => {
        this.props.loadContainers(name);
        result = response === null ? 'Action has no effect' : response._res;
        this.setState({
          longTermActionResponse: result
        });
      }).catch(() => null);
  }

  componentWillUpdate(nextProps, nextState) {
    let message;
    const {actionKey, container} = this.props;
    const status = nextState.longTermActionResponse.status || nextState.longTermActionResponse.code;
    switch (status) {
      case 200:
        message = 'Container ' + "\"" + container.name + "\"" + ' successfully ' + actionKey;
        break;
      case 304:
        message = 'Container ' + "\"" + container.name + "\"" + ' was not modified';
        break;
      default:
        message = 'Error: ' + nextState.longTermActionResponse.message;
    }
    $('#actionResponse').val(message);
  }

  render() {
    const {container} = this.props;
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
              title={"Container " + "\"" + container.name + "\""}
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
          <textarea readOnly
                    className={s["loading-dialog"]}
                    defaultValue=""
                    id="actionResponse"
          />
        )}
      </Dialog>
    );
  }
}
