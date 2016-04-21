import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';
import {toggle} from 'redux/modules/menuLeft';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import {logout} from 'redux/modules/auth';
import { routeActions } from 'react-router-redux';
import config from '../../config';

@connect(
  state => ({user: state.auth.user}),
  {logout, pushState: routeActions.push})
export default class Navbar extends Component {
  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  };

  render() {
    const {user} = this.props;
    const s = require('./Navbar.scss');

    return (
      <nav className={"navbar " + s.navbar}>
        <span className="brand-container">
          <IndexLink to="/" className="navbar-brand">{config.app.title}</IndexLink>
        </span>
        <ul className="nav navbar-nav">
          {!user &&
          <li className="nav-item">
            <Link to="/login" className="nav-link"><i className="fa fa-sign-in"></i> Login</Link>
          </li>
          }
          {user &&
          <li className="nav-item">
            <span className="nav-link"><strong>{user.name}</strong></span>
          </li>
          }
          {user &&
          <li className="nav-item">
            <a className="nav-link" onClick={this.handleLogout}><i className="fa fa-sign-in"></i> Logout</a>
          </li>
          }
        </ul>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <a className="nav-link" href="http://github.com" target="_blank" title="View on Github"><i
              className="fa fa-github"/></a>
          </li>
        </ul>
      </nav>
    );
  }
}
