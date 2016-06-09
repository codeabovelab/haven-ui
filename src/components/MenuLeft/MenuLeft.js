import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';
import {toggle} from 'redux/modules/menuLeft/menuLeft';
import { connect } from 'react-redux';

@connect(
  state => ({toggled: state.menuLeft.toggled}),
  {toggle}
)
export default class MenuLeft extends Component {
  static propTypes = {
    toggled: PropTypes.bool,
    toggle: PropTypes.func.isRequired
  };

  render() {
    const {toggled, toggle} = this.props;
    return (
      <div data-toggle={toggled} className="ml">
        <div className="ml-header">
          <span className="pull-xs-right hidden-xs-down" onClick={toggle}><i className="fa fa-bars"/></span>
        </div>
        <div className="nav nav-pills nav-stacked">
          <li className="nav-item" title="Clusters">
            <Link to="/clusters" className="nav-link">
              <span className="icon-container"><i className="fa fa-object-group"/></span>
              <span className="label">Cluster List</span>
            </Link>
          </li>
          <li className="nav-item" title="Nodes">
            <Link to="/nodes" className="nav-link">
              <span className="icon-container"><i className="fa fa-server"/></span>
              <span className="label">Node List</span>
            </Link>
          </li>
          <li className="nav-item" title="Images">
            <Link to="/images" className="nav-link">
              <span className="icon-container"><i className="fa fa-file-o"/></span>
              <span className="label">Image List</span>
            </Link>
          </li>
        </div>
      </div>
    );
  }
}
