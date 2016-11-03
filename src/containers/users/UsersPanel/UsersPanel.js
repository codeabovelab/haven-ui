import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {DockTable, StatisticsPanel} from '../../../components';
import {Link} from 'react-router';

@connect(
  state => ({
    users: state.users
  }), {})
export default class UsersPanel extends Component {
  static propTypes = {
    users: PropTypes.object
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'User',
      titles: 'Users'
    },
    {
      type: 'number',
      title: 'System Admin',
      titles: 'System Admins'
    },
    {
      type: 'number',
      title: 'Cluster Manager',
      titles: 'Cluster Managers'
    },
    {
      type: 'number',
      title: 'Application Manager',
      titles: 'Application Managers'
    }
  ];
  componentDidMount() {
    $('.input-search').focus();
  }

  render() {
    const {} = this.props;

    return (
      <div>

      </div>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }
}
