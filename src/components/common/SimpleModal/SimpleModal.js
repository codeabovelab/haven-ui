import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

export default class SimpleModal extends Component {
  static propTypes = {
    message: PropTypes.string,
    title: PropTypes.string,
    focus: PropTypes.string, //which element to focus
    size: PropTypes.string, //xl|lg
    contentComponent: PropTypes.object,
    bodyComponent: PropTypes.object
  };

  constructor() {
    super();
    this.closePromise = new Promise((resolve, reject) => {
      this._resolveClose = resolve;
    });
  }


  componentDidMount() {
    const {focus = '.btn-primary'} = this.props;
    let $el = $('#simpleModal');
    $el.modal('show');
    $el.find(focus).focus();
    $el.on('hidden.bs.modal', () => this._resolveClose());
  }

  render() {
    let {size, message, title = "", bodyComponent, contentComponent} = this.props;
    let s = require('./SimpleModal.scss');
    return (
      <div id="simpleModal" className={'modal ' + s.modal}>
        <div className={"modal-dialog " + (size ? size : '')}>
          {contentComponent}
          {!contentComponent &&
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              {message}
              {bodyComponent}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.onOk.bind(this)}>Ok</button>
            </div>
          </div>
          }
        </div>
      </div>
    );
  }

  closeIt() {
    let $el = $('#simpleModal');
    $el.modal('hide');
    this._resolveClose();
  }

  onOk() {
    this.closeIt();
  }

  static initJs(store) {
    let component;

    window.simpleModal = {
      show, close
    };

    function show(props = {}) {
      if (document.getElementById('simpleModal')) {
        return Promise.reject();
      }
      let wrapper = document.body.appendChild(document.createElement('div'));
      let childComponent = <SimpleModal {...props} ref={(c) => component = c }/>;
      let provider = ReactDOM.render(
        <Provider store={store} key="simpleModalProvider">
          {childComponent}
        </Provider>
        , wrapper);

      function cleanup() {
        ReactDOM.unmountComponentAtNode(wrapper);
        setTimeout(() => wrapper.remove());
      }

      component.closePromise.then(cleanup);
    }

    function close() {
      if (component) {
        component.closeIt();
      }
    }
  }
}
