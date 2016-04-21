import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Helmet from 'react-helmet';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from 'redux/modules/auth';
import { MenuLeft } from 'components';
import { routeActions } from 'react-router-redux';
import config from '../../config';
import { asyncConnect } from 'redux-async-connect';

@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    const promises = [];

    if (!isAuthLoaded(getState())) {
      promises.push(dispatch(loadAuth()));
    }

    return Promise.all(promises);
  }
}])
@connect(
  state => ({user: state.auth.user}),
  {logout, pushState: routeActions.push})
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // login
      this.props.pushState('/loginSuccess');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState('/');
    }
  }

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  };

  render() {
    const {user} = this.props;
    const styles = require('./App.scss');
    /*<div className={styles['full-page-container']}>*/

    return (
      <div className={styles.app}>
        <MenuLeft/>
        <div className={styles['full-page-container']}>
          <div className="above-footer">

            <Helmet {...config.app.head}/>
            <Navbar>
              <Navbar.Header>
                <Navbar.Brand>
                  <IndexLink to="/" activeStyle={{color: '#33e0ff'}}>
                    <div className={styles.brand}/>
                    <span>{config.app.title}</span>
                  </IndexLink>
                </Navbar.Brand>
                <Navbar.Toggle/>
              </Navbar.Header>

              <Navbar.Collapse eventKey={0}>
                <Nav navbar>
                  {!user &&
                  <LinkContainer to="/login">
                    <NavItem eventKey={5}>Login</NavItem>
                  </LinkContainer>}
                  {user &&
                  <LinkContainer to="/logout">
                    <NavItem eventKey={6} className="logout-link" onClick={this.handleLogout}>
                      Logout
                    </NavItem>
                  </LinkContainer>}
                </Nav>
                {user &&
                <p className={styles.loggedInMessage + ' navbar-text'}>Logged in as <strong>{user.name}</strong>.</p>}
                <Nav navbar pullRight>
                  <NavItem eventKey={1} target="_blank" title="View on Github"
                           href="https://github.com/">
                    <i className="fa fa-github"/>
                  </NavItem>
                </Nav>
              </Navbar.Collapse>
            </Navbar>

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
