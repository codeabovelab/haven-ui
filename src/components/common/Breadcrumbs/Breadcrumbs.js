import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

export class Breadcrumbs extends Component {

  static propTypes = {
    routes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    params: React.PropTypes.object
  };

  render() {
    return (
      this.buildCrumbs()
    );
  }

  buildCrumbs() {
    let {routes, params} = this.props;
    let route = routes.pop();
    let breadCrumbs = '';
    if ($.isEmptyObject(params)) {
      breadCrumbs = (
        <ul className="breadcrumb">
          <li className="active">{route.name}</li>
        </ul>
      );
    } else {
      let activeName = params.subname ? params.subname : route.name;
      if (route.name === "Job Detailed View") {
        activeName = params.name;
        breadCrumbs = (
          <ul className="breadcrumb">
            <li><Link to="/jobs">Jobs</Link></li>
            <li className="active">{activeName}</li>
          </ul>
        );
      } else if (route.name === "Network Detailed") {
        breadCrumbs = (
          <ul className="breadcrumb">
            <li><Link to="/clusters">Clusters</Link></li>
            <li><Link to={"/clusters" + "/" + params.name}>{params.name}</Link></li>
            <li><Link to={"/clusters" + "/" + params.name + "/networks"}>Networks</Link></li>
            <li className="active">{activeName}</li>
          </ul>
        );
      } else {
        breadCrumbs = (
          <ul className="breadcrumb">
            <li><Link to="/clusters">Clusters</Link></li>
            <li><Link to={"/clusters" + "/" + params.name}>{params.name}</Link></li>
            <li className="active">{activeName}</li>
          </ul>
        );
      }
    }
    return breadCrumbs;
  }
}
