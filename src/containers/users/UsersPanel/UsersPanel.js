import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {DockTable, StatisticsPanel, UsersList} from '../../../components';
import {Link} from 'react-router';
import * as usersActions from 'redux/modules/users/users';
import UserAdd from '../UserAdd/UserAdd';
import _ from 'lodash';

@connect(
  state => ({
    users: state.users
  }), {
    getRoles: usersActions.getRoles,
    getCurrentUser: usersActions.getCurrentUser,
    getUsers: usersActions.getUsers,
    getUser: usersActions.getUser,
    addUserRole: usersActions.addUserRole,
    deleteUserRole: usersActions.deleteUserRole,
    getUserRoles: usersActions.getUserRoles,
    setUser: usersActions.setUser,
    deleteUser: usersActions.deleteUser
  })
export default class UsersPanel extends Component {
  static propTypes = {
    users: PropTypes.object,
    getRoles: PropTypes.func.isRequired,
    getCurrentUser: PropTypes.func.isRequired,
    getUsers: PropTypes.func.isRequired,
    getUser: PropTypes.func.isRequired,
    addUserRole: PropTypes.func.isRequired,
    deleteUserRole: PropTypes.func.isRequired,
    getUserRoles: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'User',
      titles: 'Users'
    }
  ];
  componentDidMount() {
    const {getRoles, getUsers, getCurrentUser} = this.props;
    getRoles();
    getUsers();
    getCurrentUser();
    $('.input-search').focus();
  }

  render() {
    const {roles, usersList} = this.props.users;
    let usersCount = 0;
    if (usersList) {
      for (let el in usersList) {
        if (!usersList.hasOwnProperty(el)) {
          continue;
        }
        usersCount++;
      }
    }
    return (
      <div>
        <ul className="breadcrumb">
          <li className="active">Users</li>
        </ul>
        <StatisticsPanel metrics={this.statisticsMetrics}
                         values={[usersCount]}
        />
        <UsersList loading={typeof usersList === "undefined"}
                   data={usersList}
                   roles={roles}
                   onNewUser={this.onActionInvoke.bind(this, "create")}
                   onActionInvoke={this.onActionInvoke.bind(this)}
        />
        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </div>
    );
  }

  onHideDialog() {
    const {getUsers} = this.props;
    getUsers();
    this.setState({
      actionDialog: undefined
    });
  }

  onActionInvoke(action, userName) {
    let usersNames = _.keys(this.props.users.usersList);
    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <UserAdd title="Create User"
                     onHide={this.onHideDialog.bind(this)}
                     okTitle="Create User"
                     existingUsers={usersNames}
            />
          )
        });
        return;
      case "delete":
        confirm('Are you sure you want to delete this user')
          .then(() => {
            this.props.deleteUser(userName).catch(() => null)
              .then(() => this.props.getUsers());
          })
          .catch(() => null);
        return;
      default:
        return;
    }
  }
}
