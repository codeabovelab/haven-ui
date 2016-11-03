import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';
import {toggle} from 'redux/modules/menuLeft/menuLeft';
import { connect } from 'react-redux';

@connect(
  state => ({toggled: state.menuLeft.toggled, user: state.auth.user}),
  {toggle}
)
export default class MenuLeft extends Component {
  static propTypes = {
    toggled: PropTypes.bool,
    toggle: PropTypes.func.isRequired,
    user: PropTypes.object
  };

  render() {
    const {toggled, toggle} = this.props;

    return (
      <aside className="al-sidebar">
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

          <li className="al-sidebar-list-item" title="Jobs">
            <Link to="/settings" className="al-sidebar-list-link">
              <i className="fa fa-wrench fa-fw"/>
              <span>Settings</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Users">
            <Link to="/users" className="al-sidebar-list-link">
              <i className="fa fa-users fa-fw"/>
              <span>Users</span>
            </Link>
          </li>

          <li id="expandIcon" className="al-sidebar-list-item" title="Expand">
            <Link to="#" className="al-sidebar-list-link" onClick = {this.expand}>
              <i className="fa fa-chevron-right fa-2x" data-direction="right" />
            </Link>
          </li>
        </ul>
      </aside>
    );
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
