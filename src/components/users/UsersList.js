import React, {Component, PropTypes} from 'react';
import { Link, RouteHandler } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import {DockTable, ActionMenu} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Nav, NavItem} from 'react-bootstrap';
import {Dialog, PropertyGrid} from 'components';
import _ from 'lodash';

export default class UsersList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    roles: PropTypes.object
  };

  COLUMNS = [
    {
      name: 'user',
      label: 'Username',
      width: '30%',
      sortable: true
    },
    {
      name: 'email',
      label: 'Email',
      width: '20%',
      sortable: true,
      render: this.emailRender.bind(this)
    },
    {
      name: 'role',
      label: 'Role',
      width: '15%',
      sortable: true,
      render: this.roleRender.bind(this)
    },
    {
      name: 'actions',
      label: 'Actions',
      width: '20%'
    }
  ];

  render() {
    const {data, roles} = this.props;
    console.log(data);
    const rows = [];

    if (data) {
      for (let el in data) {
        if (!data.hasOwnProperty(el)) {
          continue;
        }
        rows.push(data[el]);
      }
    }
    console.log(rows);

    return (
      <Panel>
          {this.props.loading && (
            <ProgressBar active now={100}/>
          )}

          {(this.props.data && !this.props.loading) && (
            <div>
              <div className="users">
                <ButtonToolbar className="pulled-right">
                  <Button
                    bsStyle="primary"
                    onClick={console.log('click!')}
                  >
                    <i className="fa fa-plus"/>&nbsp;
                    New User
                  </Button>
                </ButtonToolbar>
                <DockTable columns={this.COLUMNS}
                           rows={rows}
                />
              </div>
            </div>
          )}

          {(this.props.data && this.props.data.length === 0) && (
            <div className="alert alert-info">
              No users yet
            </div>
          )}

        {(this.state && this.state.actionDialog) && (
          <div>
            {this.state.actionDialog}
          </div>
        )}
      </Panel>
    );
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  emailRender(row) {
    return (
      <td>
        {_.get(row, 'email', '')}
      </td>
    );
  }

  roleRender(row) {
    return (
      <td>
        {_.get(row, 'roles[0].name', '')}
      </td>
    );
  }
}
