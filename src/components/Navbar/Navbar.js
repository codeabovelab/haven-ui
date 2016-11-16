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
        <a href="" className="al-logo clearfix"><span>Dock</span>center</a>
        <a href className="collapse-menu-link" ba-sidebar-toggle-menu></a>

        {user && (
          <Dropdown className="user-profile">
            <Dropdown.Toggle>
              <a className="profile-toggle-link">
                <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y&s=45" />
              </a>
            </Dropdown.Toggle>

            <Dropdown.Menu pullRight>
              <MenuItem onClick={this.handleLogout}>Sign out</MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    );
  }
}
