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
    console.log(this.props);

    let sidemenu = (
      <div />
    );

    if (this.props.user) {
      sidemenu = (
        <div data-toggle={toggled} className="ml">
          <div className="ml-header">
            <span className="pull-xs-right hidden-xs-down" onClick={toggle}><i className="fa fa-bars"/></span>
          </div>
          <div className="nav nav-pills nav-stacked">
            <li className="nav-item" title="Dashboard">
              <Link to="/dashboard" className="nav-link">
                <i className="fa fa-tachometer fa-fw"/>
                <span className="label">Dashboard</span>
              </Link>
            </li>
            <li className="nav-item" title="Clusters">
              <Link to="/clusters" className="nav-link">
                <i className="fa fa-object-group fa-fw"/>
                <span className="label">Cluster List</span>
              </Link>
            </li>
            <li className="nav-item" title="Nodes">
              <Link to="/nodes" className="nav-link">
                <i className="fa fa-server fa-fw"/>
                <span className="label">Node List</span>
              </Link>
            </li>
            <li className="nav-item" title="Images">
              <Link to="/images" className="nav-link">
                <i className="fa fa-file-o fa-fw"/>
                <span className="label">Image List</span>
              </Link>
            </li>
            <li className="nav-item" title="Registries">
              <Link to="/registries" className="nav-link">
                <i className="fa fa-list fa-fw"/>
                <span className="label">Registries List</span>
              </Link>
            </li>
          </div>
        </div>
      );
    }

    return sidemenu;
  }
}
