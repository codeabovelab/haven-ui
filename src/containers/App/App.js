import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Helmet from 'react-helmet';
import { MenuLeft, Navbar } from 'components';
import { routerActions } from 'react-router-redux';
import config from '../../config';
import {Breadcrumbs} from '../../components/common/Breadcrumbs/Breadcrumbs';
import { asyncConnect } from 'redux-async-connect';
//require('bootstrap/dist/css/bootstrap.css');

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];
    return Promise.all(promises);
  }
}])
@connect(
  state => ({user: state.auth.user}),
  {
    pushState: routerActions.push
  })
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    routes: PropTypes.array,
    params: PropTypes.object,
    user: PropTypes.object,
    pushState: PropTypes.func.isRequired
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
  }

  render() {
    let pageTitle = this.props.routes[this.props.routes.length - 1].name;
    let rootClass = this.props.user ? "" : " menu-collapsed";

    return (
      <div className={"app" + rootClass}>
        <Helmet {...config.app.head} />

        {this.props.user && (
          <MenuLeft />
        )}

        <Navbar />

        <div className="al-main">
          <div className="al-content">
            {this.props.user && (
              <div className="content-top clearfix">
                <h1 className="al-title ng-binding">
                  {pageTitle}
                </h1>

                <Breadcrumbs
                  routes={this.props.routes}
                  params={this.props.params}
                />
              </div>
            )}

            {this.props.children}
          </div>
        </div>

        <footer className="al-footer clearfix">
          <div className="al-footer-right"></div>
          <div className="al-footer-main clearfix">
            <div className="al-copy">
              &copy; {(new Date()).getFullYear()} Dockmaster
            </div>
          </div>
        </footer>
      </div>
    );
  }
}
