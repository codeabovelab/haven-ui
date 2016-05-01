import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Helmet from 'react-helmet';
import {loadFromLS} from 'redux/modules/auth/auth';
import { MenuLeft, Navbar } from 'components';
import { routeActions } from 'react-router-redux';
import config from '../../config';
import { asyncConnect } from 'redux-async-connect';

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];

    promises.push(dispatch(loadFromLS()));
    //if (!isAuthLoaded(getState())) {
    //  promises.push(dispatch(loadAuth()));
    //}

    return Promise.all(promises);
  }
}])
@connect(
  state => ({user: state.auth.user}),
  {pushState: routeActions.push})
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    pushState: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // login
      this.props.pushState('/');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState('/login');
    }
  }

  render() {
    return (
      <div className="app">
        <Helmet {...config.app.head}/>
        <MenuLeft/>
        <div className="full-page-container">
          <div className="above-footer">
            <Navbar />
            <div className="main">
              {this.props.children}
            </div>
          </div>

          <div className="footer">
            <div className="text-xs-center">
              &copy; {(new Date()).getFullYear()} Dockmaster
            </div>
          </div>
        </div>
      </div>
    );
  }
}
