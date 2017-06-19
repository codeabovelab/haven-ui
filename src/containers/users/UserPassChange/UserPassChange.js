import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {setUser, getCurrentUser} from 'redux/modules/users/users';
import {createValidator, required, match} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, Alert, HelpBlock, Panel, Button} from 'react-bootstrap';
import Helmet from 'react-helmet';
import _ from 'lodash';

@connect(state => ({
  createError: state.users.setUserError,
  users: state.users
}), {setUser, getCurrentUser})
@reduxForm({
  form: 'UserPassChange',
  fields: [
    'password',
    'confirmPassword'
  ],
  validate: createValidator({
    password: [required, match('confirmPassword', 'Passwords do not match')]
  })
})
export default class UserAdd extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    okTitle: PropTypes.string,
    setUser: PropTypes.func.isRequired,
    getCurrentUser: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = {
      passwordChanged: false
    };
  }

  componentWillMount() {
    this.props.getCurrentUser();
  }

  componentWillUnmount() {
    const {users} = this.props;
    if (!users.currentUser.credentialsNonExpired && !this.state.passwordChanged) {
      browserHistory.push('/my_account');
    }
  }

  onSubmit() {
    const {fields, setUser, users} = this.props;
    const userName = users.currentUser.name;
    let userData = {
      "password": fields.password.value,
      "credentialsNonExpired": true
    };
    this.setState({
      passwordChanged: false
    });
    setUser(userName, userData).then(() => {
      this.setState({
        passwordChanged: true
      });
      this.props.resetForm();
      getCurrentUser();
    });
  }

  render() {
    const {fields, users} = this.props;
    const loadingCurrentUser = users.loadingCurrentUser;
    return (
      <Panel>
        <Helmet title="My Account"/>
        {this.props.createError && (
          <Alert bsStyle="danger">
            {this.props.createError}
          </Alert>
        )}
        <div className="col-md-1" style={{textAlign: 'center'}}>
          {users.settingUser && (
            <span>&nbsp;<i className="fa fa-spinner fa-2x fa-pulse margin-top-20"/></span>
          )}
        </div>
        <div className="col-md-10">
          {this.state.passwordChanged && (
            <Alert bsStyle="success">
              Password Successfully Changed
            </Alert>
          )}
          {(!this.state.passwordChanged && !_.get(users, 'currentUser.credentialsNonExpired', true) && !loadingCurrentUser) && (
            <Alert bsStyle="info">
              You need to change the preset password to continue work with Haven-UI.
            </Alert>
          )}
          <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
            <div className="col-md-5 col-sm-12">
            <FormGroup title="required" required
                       validationState={(fields.password.error && fields.password.touched) ? "error" : null}>
              <ControlLabel>Password</ControlLabel>
              <FormControl type="password"
                           {...fields.password}
                           placeholder="New Password (required)"
              />
              {(fields.password.error && fields.password.touched) && (
                <HelpBlock>{fields.password.error}</HelpBlock>
              )}
            </FormGroup>
            </div>
            <div className="col-md-5 col-sm-12">
            <FormGroup
              validationState={fields.password.error === "Passwords do not match" && fields.password.touched ? "error" : null}>
              <ControlLabel>Confirm Password</ControlLabel>

              <FormControl type="password"
                           {...fields.confirmPassword}
                           placeholder="Confirm Password"
              />
            </FormGroup>
            </div>
            <div className="col-md-2 col-sm-12">
              <Button
                className="buttonLink"
                onClick={this.onSubmit.bind(this)}
                bsStyle="primary"
                disabled={!!(fields.password.error || fields.confirmPassword.error)}
              >Change Password</Button>
            </div>
          </form>
          <div ref="error" className="text-danger text-xs-center text-error">
          </div>
        </div>
        <div className="col-md-1">
        </div>
      </Panel>
    );
  }
}
