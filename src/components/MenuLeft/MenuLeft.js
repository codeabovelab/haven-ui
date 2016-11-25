import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';
import {toggle} from 'redux/modules/menuLeft/menuLeft';
import {logout} from 'redux/modules/auth/auth';
import { connect } from 'react-redux';
import {getCurrentUser} from 'redux/modules/users/users';
import _ from 'lodash';
import {UserPassChange} from '../../containers/index';

@connect(
  state => ({
    toggled: state.menuLeft.toggled,
    user: state.auth.user,
    users: state.users
  }),
  {toggle, getCurrentUser, logout}
)
export default class MenuLeft extends Component {
  static propTypes = {
    toggled: PropTypes.bool,
    toggle: PropTypes.func.isRequired,
    user: PropTypes.object,
    users: PropTypes.object,
    getCurrentUser: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired
  };

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
    window.location.href = '/login';
  };

  componentWillMount() {
    const {getCurrentUser} = this.props;
    getCurrentUser().then(()=> {
      const {users} = this.props;
      if (!users.currentUser.credentialsNonExpired) {
        this.showPasswordChange("You need to change the preset password to continue.");
      }
    });
  }

  onHideDialog() {
    const {getCurrentUser} = this.props;
    getCurrentUser().then(()=> {
      const {users} = this.props;
      if (!users.currentUser.credentialsNonExpired) {
        this.setState({
          actionDialog: undefined
        });
        this.showPasswordChange("You need to change the preset password to continue.");
      } else {
        this.setState({
          actionDialog: undefined
        });
      }
    });

    this.setState({
      actionDialog: undefined
    });
  }

  showPasswordChange(title) {
    const {users} = this.props;
    this.setState({
      actionDialog: (
        <UserPassChange title={title}
                        onHide={this.onHideDialog.bind(this)}
                        okTitle="Change Password"
                        userName={users.currentUser.name}
        />
      )
    });
  }

  render() {
    const {toggled, toggle, users} = this.props;
    let role = _.get(this.props, 'users.currentUser.role', '');

    return (
      <aside className="al-sidebar">
        <div className="clearfix">
          <a href="" className="al-logo clearfix"><img src="/logo-white.png" title="Haven" />
            <span className="product-name">Haven</span></a>
        </div>
        <ul className="al-sidebar-list">
          <li className="al-sidebar-list-item" title="Dashboard">
            <Link to="/dashboard" className="al-sidebar-list-link">
              <i className="fa fa-tachometer"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Clusters">
            <Link to="/clusters" className="al-sidebar-list-link">
              <i className="fa fa-object-group fa-fw"/>
              <span>Clusters</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Containers">
            <Link to="/clusters/all" className="al-sidebar-list-link">
              <i className="fa fa-square-o"/>
              <span>Containers</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Nodes">
            <Link to="/nodes" className="al-sidebar-list-link">
              <i className="fa fa-server fa-fw"/>
              <span>Nodes</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Images">
            <Link to="/images" className="al-sidebar-list-link">
              <i className="fa fa-file-o fa-fw"/>
              <span>Images</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Registries">
            <Link to="/registries" className="al-sidebar-list-link">
              <i className="fa fa-list fa-fw"/>
              <span>Registries</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Jobs">
            <Link to="/jobs" className="al-sidebar-list-link">
              <i className="fa fa-cogs fa-fw"/>
              <span>Jobs</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Change password">
            <Link className="al-sidebar-list-link" onClick={()=>{this.showPasswordChange("Change Password");}}>
              <i className="fa fa-id-badge fa-fw"/>
              <span>My Account</span>
            </Link>
          </li>
          {role === 'ROLE_ADMIN' && (
            <li className="al-sidebar-list-item with-sub-menu" title="Admin's Panel">
              <Link className="al-sidebar-list-link" onClick={()=>this.showSubBlock('adminSublist')}>
                <i className="fa fa-briefcase fa-fw"/>
                <span>Admin's Panel</span>
                <b className="fa fa-angle-down"/>
              </Link>
              <ul className="al-sidebar-sublist shown-sublist hidden-sublist" id="adminSublist">
                <li className="ba-sidebar-sublist-item" title="Users">
                  <Link to="/users" className="al-sidebar-list-link">
                    <span>Users</span>
                  </Link>
                </li>
                <li className="al-sidebar-list-item" title="Settings">
                  <Link to="/settings" className="al-sidebar-list-link">
                    <span>Settings</span>
                  </Link>
                </li>
                <li className="al-sidebar-list-item" title="Get Haven Agent">
                  <a href="http://hb1.codeabovelab.com/res/agent/dockmaster-agent.py" className="al-sidebar-list-link">
                    <span>Get Agent</span>
                  </a>
                </li>
              </ul>
            </li>
          )}
          <li className="al-sidebar-list-item" title="Sign Out">
            <Link className="al-sidebar-list-link" onClick={this.handleLogout}>
              <i className="fa fa-sign-out fa-fw"/>
              <span>Sign out</span>
            </Link>
          </li>

          <li id="expandIcon" className="al-sidebar-list-item" title="Expand">
            <Link to="#" className="al-sidebar-list-link" onClick = {this.expand}>
              <i className="fa fa-chevron-right fa-2x" data-direction="right" />
            </Link>
          </li>
        </ul>
        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </aside>
    );
  }

  showSubBlock(id) {
    let $subBlock = $("#" + id);
    $subBlock.slideToggle(300);
  }

  expand(e) {
    e.preventDefault();
    let $iconLi = $("#expandIcon");
    let $icon = $iconLi.find("i");
    let arrowDirection = $icon.attr("data-direction");
    let $mainContent = $(".al-main");
    let $footer = $(".al-footer-main");
    let $sidebar = $(".al-sidebar");

    if (arrowDirection === 'right') {
      $sidebar.addClass("sidebar-expanded");
      $icon.removeClass("fa-chevron-right").addClass("fa-chevron-left");
      $mainContent.addClass("extra-margin-content");
      $footer.addClass('extra-margin-footer');
      $iconLi.attr("title", "Collapse");
      $icon.attr("data-direction", "left");
    } else {
      $sidebar.removeClass("sidebar-expanded");
      $icon.removeClass("fa-chevron-left").addClass("fa-chevron-right");
      $mainContent.removeClass("extra-margin-content");
      $footer.removeClass('extra-margin-footer');
      $iconLi.attr("title", "Expand");
      $icon.attr("data-direction", "right");
    }
  }
}
