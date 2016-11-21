import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Helmet from 'react-helmet';
import { MenuLeft, Navbar } from 'components';
import { routerActions } from 'react-router-redux';
import config from '../../config';
import {removeErrorMessage} from 'redux/modules/errors/errors';
import {Breadcrumbs} from '../../components/common/Breadcrumbs/Breadcrumbs';
import { asyncConnect } from 'redux-async-connect';

//this component works only as CommonJS module
let NotificationSystem = require('react-notification-system');

//require('bootstrap/dist/css/bootstrap.css');

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];
    return Promise.all(promises);
  }
}])
@connect(
  state => ({
    user: state.auth.user,
    errors: state.errors
  }),
  {
    pushState: routerActions.push,
    removeErrorMessage
  })
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    routes: PropTypes.array,
    errors: PropTypes.array,
    params: PropTypes.object,
    user: PropTypes.object,
    pushState: PropTypes.func.isRequired,
    removeErrorMessage: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // login
      this.props.pushState('/dashboard');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState('/login');
    }

    const errors = nextProps.errors;
    if (errors && errors.length > 0) {
      errors.forEach((err, i) => {
        let msg = err.message || (err.path ? `${err.path}: ${err.error}` : err.error);
        this._notificationSystem.addNotification({
          uid: i + 1,
          title: 'Server connection problem',
          message: msg,
          level: 'error',
          autoDismiss: 1,
          position: 'tc',
          onRemove: this.removeNotification.bind(this)
        });
      });
    }
  }

  removeNotification(n) {
    this.props.removeErrorMessage(n.uid - 1);
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  render() {
    let pageTitle = this.props.routes[this.props.routes.length - 1].name;
    let rootClass = this.props.user ? "" : " menu-collapsed";

    return (
      <div className={"app" + rootClass}>
        <NotificationSystem ref="notificationSystem" />

        <Helmet {...config.app.head} />

        {this.props.user && (
          <MenuLeft />
        )}
        <div className="al-main">
          <div className="al-content">
            {this.props.user && (
              <div className="content-top clearfix">
                <h1 className="al-title ng-binding">
                  {pageTitle}
                </h1>

                {false && (
                  <Breadcrumbs
                    routes={this.props.routes}
                    params={this.props.params}
                  />
                )}
              </div>
            )}

            {this.props.children}
          </div>
        </div>

        <footer className="al-footer clearfix">
          <div className="al-footer-right"></div>
          <div className="al-footer-main clearfix">
            <div className="al-copy">
              &copy; {(new Date()).getFullYear()} Code Above Lab Haven
            </div>
          </div>
        </footer>
      </div>
    );
  }
}
