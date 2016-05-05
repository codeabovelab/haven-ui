import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

export default class SimpleModal extends Component {
  static propTypes = {
    size: PropTypes.string,
    message: PropTypes.string,
    title: PropTypes.string,
    childComponent: PropTypes.object
  };

  constructor() {
    super();
    this.closePromise = new Promise((resolve, reject) => {
      this._resolve = resolve;
    });
  }


  componentDidMount() {
    let $el = $('#simpleModal');
    $el.modal('show');
    $el.find('.btn-primary').focus();
    $el.on('hidden.bs.modal', () => this._resolve());
  }

  render() {
    let {size, message, title = "", childComponent} = this.props;
    let s = require('./SimpleModal.scss');
    let modalStyle = size ? s[size] : null;
    modalStyle = modalStyle ? modalStyle : '';
    return (
      <div id="simpleModal" className="modal">
        <div className={"modal-dialog " + modalStyle}>
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">{title}</h4>
            </div>
            <div className="modal-body">
              {message}
              {childComponent}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.onOk.bind(this)}>Ok</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  closeIt() {
    let $el = $('#simpleModal');
    $el.modal('hide');
  }

  onOk() {
    this.closeIt();
    this._resolve();
  }

  static initJs(store) {
    window.simpleModal = (props = {}) => {
      if (document.getElementById('simpleModal')) {
        return Promise.reject();
      }
      let wrapper = document.body.appendChild(document.createElement('div'));
      let component;
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
    };
  }
}
