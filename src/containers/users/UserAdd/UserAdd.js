import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {load} from 'redux/modules/clusters/clusters';
import {setUser, addUserRole, setACL, getUserAcl} from 'redux/modules/users/users';
import {createValidator, required, email, match} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert, Button, ButtonToolbar} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  users: state.users,
  clusters: state.clusters,
  createError: state.users.setUserError
}), {load, setUser, addUserRole, setACL, getUserAcl})
@reduxForm({
  form: 'UserAdd',
  fields: [
    'email',
    'username',
    'role',
    'password',
    'confirmPassword'
  ],
  validate: createValidator({
    username: [required],
    email: [email],
    password: [required, match('confirmPassword', 'Passwords do not match')]
  })
})
export default class UserAdd extends Component {
  static propTypes = {
    users: PropTypes.object.isRequired,
    clusters: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func,
    submitting: PropTypes.bool,
    createError: PropTypes.string,
    valid: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    okTitle: PropTypes.string,
    load: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    addUserRole: PropTypes.func.isRequired,
    setACL: PropTypes.func.isRequired,
    getUserAcl: PropTypes.func.isRequired,
    existingUsers: PropTypes.array,
    userName: PropTypes.string
  };
  constructor() {
    super();
    this.state = {
      firstLoad: true,
      clustersACL: {}
    };
  }
  onSubmit() {
    const {fields, setUser, setACL, onHide, existingUsers, userName, resetForm} = this.props;
    const {usersList} = this.props.users;
    let existingAcl = {};
    if (userName) {
      existingAcl = this.props.users.usersList[userName].acl;
    }
    this.setState({
      firstLoad: false
    });
    if (_.includes(existingUsers, fields.username.value) && this.props.okTitle === 'Create User') {
      this.refs.usernameError.textContent = 'User with name: "' + fields.username.value + '" already exists. Please use another name.';
      return false;
    }
    let clustersACL = this.state.clustersACL;
    let aclData = this.fillAclData(fields, clustersACL, existingAcl);
    let roles = [
      {
        "name": fields.role.value,
        "tenant": "root"
      }
    ];
    let userData = {
      "accountNonExpired": true,
      "accountNonLocked": true,
      "credentialsNonExpired": false,
      "email": fields.email.value || '',
      "enabled": true,
      "password": fields.password.value || '',
      "roles": roles,
      "tenant": "root",
    };
    if (userName) {
      userData.credentialsNonExpired = true;
      delete userData.password;
      if (usersList) {
        let previousRole = _.get(usersList, userName + '.roles.0.name', '');
        if (fields.role.value === previousRole) {
          userData.roles = [];
        } else if (previousRole && previousRole !== fields.role.value) {
          userData.roles = [...roles, {
            "delete": true,
            "name": previousRole,
            "tenant": "root"
          }];
        }
      }
    }
    setUser(fields.username.value, userData).then(()=> {
      if (!_.isEmpty(aclData)) {
        setACL(aclData);
      }
    }).then(()=>{
      resetForm();
      onHide();
    });
  }

  fillAclData(fields, clustersACL, existingAcl) {
    let aclData = {};
    _.each(clustersACL, (value, key)=> {
      let id = "CLUSTER:s:" + key;
      let permission = this.state.clustersACL[key];
      let permissionVal = "";
      switch (permission) {
        case "readOnly":
          permissionVal = "R";
          break;
        case "manager":
          permissionVal = "RU";
          break;
        case "none":
          permissionVal = "";
          if (existingAcl && existingAcl[key]) {
            aclData = {
              ...aclData,
              [id]: {
                "entries": [
                  {
                    "id": fields.username.value + ":CLUSTER:" + key,
                    "delete": true
                  }
                ]
              }
            };
          }
          break;
        default:
          break;
      }
      if (permissionVal) {
        if (fields.role.value === 'ROLE_ADMIN') {
          aclData = {
            ...aclData,
            [id]: {
              "entries": [
                {
                  "id": fields.username.value + ":CLUSTER:" + key,
                  "delete": true
                }
              ]
            }
          };
        } else {
          aclData = {
            ...aclData,
            [id]: {
              "entries": [
                {
                  "id": fields.username.value + ":CLUSTER:" + key,
                  "sid": {
                    "type": "PRINCIPAL",
                    "principal": fields.username.value,
                    "tenant": "root"
                  },
                  "granting": true,
                  "permission": permissionVal
                }
              ]
            }
          };
        }
      }
    });
    return aclData;
  }

  componentWillMount() {
    const {load, fields, userName, getUserAcl} = this.props;
    const {usersList} = this.props.users;
    load().then(()=> {
      const {clusters} = this.props;
      _.each(clusters, (value, key)=> {
        this.onPermissionChange("none", key);
      });
      if (userName) {
        //hack to pass validation, "password" property ll be deleted on submit. Password can be changed in a UserPassChange form
        fields.password.onChange('dummy');
        fields.confirmPassword.onChange('dummy');
        fields.username.onChange(userName);
        let previousEmail = _.get(usersList, userName + '.email', '');
        let previousRole = _.get(usersList, userName + '.roles.0.name', '');
        if (previousRole) {
          fields.role.onChange(previousRole);
        }
        if (previousEmail) {
          fields.email.onChange(previousEmail);
        }
        getUserAcl(userName).then(()=> {
          const {acl} = this.props.users.usersList[userName];
          _.forEach(acl, (value, key) => {
            if (this.state.clustersACL[key] && value.permission) {
              let aclVal = "none";
              switch (value.permission) {
                case "R":
                  aclVal = "readOnly";
                  break;
                case "RU":
                  aclVal = "manager";
                  break;
                default:
                  break;
              }
              this.onPermissionChange(aclVal, key);
            }
          });
        });
      }
    });
  }

  componentDidMount() {
    const {fields, userName} = this.props;
    let defaultRole = $('#roleSelect').val();
    if (this.state.firstLoad && !userName) {
      fields.role.onChange(defaultRole);
    }
  }

  render() {
    require('./UserAdd.scss');
    const { fields, okTitle, clusters, userName } = this.props;
    const {roles, usersList} = this.props.users;

    return (
      <Dialog show
              dialogClassName="medium-size-dialog"
              title={this.props.title}
              submitting={this.props.submitting}
              allowSubmit={this.props.valid}
              onReset={this.props.resetForm}
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
              okTitle={okTitle || 'OK'}
      >
        {this.props.createError && (
          <Alert bsStyle="danger">
            {this.props.createError}
          </Alert>
        )}

        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
          {/* it prevents browser from filling every user'a password and email fields with the same cached data*/}
          <input type="password" className="dummyInput"/>

          <FormGroup title="required" required validationState={fields.username.error && fields.username.touched ? "error" : ""}>
            <ControlLabel>Name</ControlLabel>
            <FormControl type="text"
                         {...fields.username}
                         placeholder="User Name (required)"
                         disabled = {okTitle === 'Update User'}
                         defaultValue = {userName === 'undefined' ? '' : userName}
            />
            {fields.username.error && fields.username.touched && (
              <HelpBlock>{fields.username.error}</HelpBlock>
            )}
          </FormGroup>
          <div ref="usernameError" className="text-danger text-xs-center text-error field-error">
          </div>

          <FormGroup validationState={fields.email.error ? "error" : ""}>
            <ControlLabel>Email</ControlLabel>
            <FormControl type="text"
                         {...fields.email}
                         placeholder="Email"
            />
            {fields.email.error && (
              <HelpBlock>{fields.email.error}</HelpBlock>
            )}
          </FormGroup>

          {!userName && (
            <div>
              <FormGroup title="required" required validationState={fields.password.error && fields.password.touched ? "error" : ""}>
                <ControlLabel>Password</ControlLabel>

                <FormControl type="password"
                             {...fields.password}
                             placeholder="Password"
                />
                {(fields.password.error && fields.password.touched) && (
                  <HelpBlock>{fields.password.error}</HelpBlock>
                )}
              </FormGroup>

              <FormGroup validationState={fields.password.error === "Passwords do not match" && fields.password.touched ? "error" : ""}>
                <ControlLabel>Confirm Password</ControlLabel>

                <FormControl type="password"
                             {...fields.confirmPassword}
                             placeholder="Confirm Password"
                />
              </FormGroup>
            </div>
          )}

          <FormGroup>
            <ControlLabel>Role</ControlLabel>
            <FormControl id="roleSelect" componentClass="select" placeholder="select" {...fields.role}>
              {
                roles.map(function listNodes(role, i) {
                  if (typeof(role) !== 'undefined' && role.name) {
                    return <option key={i} value={role.name}>{role.name}</option>;
                  }
                })
              }
            </FormControl>
          </FormGroup>

          {fields.role.value === 'ROLE_USER' && (
            <div>
              <b>Clusters Permissions</b>
              <div className="row acl-buttons-block">
                {
                  _.map(clusters, (cluster, i)=> {
                    if (typeof(cluster) !== 'undefined' && cluster.name !== 'all' && cluster.name !== 'orphans') {
                      return (
                        <div key={i}>
                          <FormGroup>
                            <div className="col-md-4 buttongroup-label"><b>{cluster.name}</b></div>
                            <div className="col-md-8">
                              <ButtonToolbar key={cluster.name} className="pseudo-radio-group pulled-right">
                                <Button bsStyle="default" className="aclButton"
                                        onClick={this.onPermissionChange.bind(this, 'manager', cluster.name)} key={1}
                                        active={this.state.clustersACL[cluster.name] === 'manager'}>Manager</Button>
                                <Button className="middleButton aclButton"
                                        onClick={this.onPermissionChange.bind(this, 'readOnly', cluster.name)} key={2}
                                        active={this.state.clustersACL[cluster.name] === 'readOnly'}>Read Only</Button>
                                <Button className="aclButton"
                                        onClick={this.onPermissionChange.bind(this, 'none', cluster.name)} key={3}
                                        active={this.state.clustersACL[cluster.name] === 'none'}>None</Button>
                              </ButtonToolbar>
                            </div>
                          </FormGroup>
                        </div>
                      );
                    }
                  })
                }
              </div>
            </div>
          )}
        </form>
        <div ref="error" className="text-danger text-xs-center text-error">
        </div>
      </Dialog>
    );
  }

  onPermissionChange(aclVal, clusterName) {
    this.setState({
      clustersACL: {
        ...this.state.clustersACL,
        [clusterName]: aclVal
      }
    });
  }
}
