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
              <i className="ion-android-home"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className="al-sidebar-list-item" title="Clusters">
            <Link to="/clusters" className="al-sidebar-list-link">
              <i className="fa fa-object-group fa-fw"/>
              <span>Clusters</span>
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
        </ul>
      </aside>
    );
  }
}
