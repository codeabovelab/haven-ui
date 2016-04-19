import React, {Component} from 'react';
import { Link } from 'react-router';

export default class MenuLeft extends Component {
  render() {
    return (
    <div className="ml"> Left Menu
      <div className="ml-header">
        <span className="pull-xs-right hidden-xs-down"><i className="fa fa-bars"></i></span>
      </div>
      <div className="nav nav-pills nav-stacked">
        <li className="nav-item">
          <Link to="clusterList" className="nav-link">Cluster List</Link>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="">Node List</a>
        </li>
      </div>
    </div>
    );
  }
}
