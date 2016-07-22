import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';
import {toggle} from 'redux/modules/menuLeft/menuLeft';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import {logout} from 'redux/modules/auth/auth';
import { routerActions } from 'react-router-redux';
import config from '../../config';
import {Dropdown, MenuItem} from 'react-bootstrap';

@connect(
  state => ({user: state.auth.user}),
  {logout, pushState: routerActions.push})
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

    return (
      <div className="page-top clearfix" scroll-position="scrolled" max-height="50">
        <a href="" className="al-logo clearfix"><span>Dock</span>master</a>
        <a href className="collapse-menu-link" ba-sidebar-toggle-menu></a>

        <ul className="al-msg-center clearfix">
          <li uib-dropdown>
            <a href uib-dropdown-toggle>
              <i className="fa fa-bell-o"></i><span>0</span>

              <div className="notification-ring"></div>
            </a>

            <div uib-dropdown-menu className="top-dropdown-menu">
              <i className="dropdown-arr"></i>

              <div className="header clearfix">
                <strong>Notifications</strong>
                <a href>Mark All as Read</a>
                <a href>Settings</a>
              </div>
              <div className="msg-list">
              </div>
              <a href>See all notifications</a>
            </div>
          </li>
          <li uib-dropdown>
            <a href className="msg" uib-dropdown-toggle>
              <i className="fa fa-envelope-o"></i><span>0</span>
              <div className="notification-ring"></div>
            </a>
            <div uib-dropdown-menu className="top-dropdown-menu">
              <i className="dropdown-arr"></i>
              <div className="header clearfix">
                <strong>Messages</strong>
                <a href>Mark All as Read</a>
                <a href>Settings</a>
              </div>
              <div className="msg-list">
              </div>
              <a href>See all messages</a>
            </div>
          </li>
        </ul>

        <Dropdown className="user-profile">
          <Dropdown.Toggle>
            <a className="profile-toggle-link">
              <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y&s=45" />
            </a>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <MenuItem eventKey="1">Profile</MenuItem>
            <MenuItem eventKey="2">Settings</MenuItem>
            <MenuItem eventKey="3">Sign out</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
