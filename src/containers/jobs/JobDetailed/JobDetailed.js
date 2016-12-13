import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {PropertyGrid, ActionMenu} from '../../../components/index';
import {Link} from 'react-router';
import {Dropdown, SplitButton, Button, ButtonToolbar, Accordion, Panel, ProgressBar, Tabs, Tab} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  jobs: state.jobs
}), {})
export default class JobDetailed extends Component {
  static propTypes = {
    params: PropTypes.object,
    jobs: PropTypes.object.isRequired,
  };

  ACTIONS = [

  ];

  render() {
    const {params: {name}, jobs} = this.props;
    const job = jobs.jobs[name];
    console.log('Job: ', job);

    return (
      <div>
        <ul className="breadcrumb">
          <li><Link to="/jobs">Jobs</Link></li>
          <li className="active">{name}</li>
        </ul>
        <Panel header="Job Detailed">
          Job Detailed
        </Panel>
      </div>
    );
  }

}


