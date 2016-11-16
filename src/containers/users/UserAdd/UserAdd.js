import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import {load, create, loadNodes} from 'redux/modules/clusters/clusters';
import {create as createNode} from 'redux/modules/nodes/nodes';
import {setUser, addUserRole, setACL, getUsers} from 'redux/modules/users/users';
import {createValidator, required, email} from 'utils/validation';
import {Dialog} from 'components';
import {FormGroup, FormControl, ControlLabel, HelpBlock, Alert, Button, ButtonGroup, Input, ButtonToolbar} from 'react-bootstrap';
import _ from 'lodash';

@connect(state => ({
  users: state.users,
  clusters: state.clusters,
  createError: state.users.setUserError
}), {create, load, createNode, loadNodes, setUser, addUserRole, setACL})
@reduxForm({
  form: 'ClusterAdd',
  fields: [
    'email',
    'username',
    'role'
  ],
  validate: createValidator({
    username: [required],
    email: [email]
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
    getUsers: PropTypes.func.isRequired
  };
  constructor() {
    super();
    this.state = {
      firstLoad: true,
      clustersACL: {}
    };
  }
  onSubmit() {
    const {fields, setUser, setACL, getUsers, onHide} = this.props;
    this.setState({
      firstLoad: false
    });
    console.log(fields);
    let userData = {
      "accountNonExpired": true,
      "accountNonLocked": true,
      "credentialsNonExpired": true,
      "email": fields.email.value || '',
      "enabled": true,
      "password": "string",
      "roles": [
        {
          "name": fields.role.value || '',
          "tenant": "root"
        }
      ],
    };
    setUser(fields.username.value, userData).then(()=> {
      let aclData = {
        "CLUSTER:s:dev": {
          "entries": [
            {
              "sid": {
                "type": "PRINCIPAL",
                "principal": fields.username.value,
                "tenant": "root"
              },
              "granting": true,
              "permission": "RU"
            }
          ]
        }
      };
      setACL(aclData);
    }).then(()=>onHide());
  }

  componentWillMount() {
    const {load} = this.props;
    load().then(()=> {
      const {clusters} = this.props;
      console.log(clusters);
      _.each(clusters, (value, key)=> {
        this.setState({
          clustersACL: {
            ...this.state.clustersACL,
            [key]: "none"
          }
        });
      });
    });
  }

  componentDidMount() {
    const {fields} = this.props;
    console.log($('#roleSelect').val());
    if (this.state.firstLoad) {
      fields.role.onChange($('#roleSelect').val());
    }
  }

  render() {
    const { fields, okTitle, clusters } = this.props;
    const {roles, usersList} = this.props.users;
    return (
      <Dialog show
              size="default"
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
          <FormGroup title="required" required validationState={(fields.username.error && (!this.state.firstLoad || fields.username.touched)) ? "error" : ""}>
            <ControlLabel>Name</ControlLabel>
            <FormControl type="text"
                         {...fields.username}
                         placeholder="User Name (required)"
                         disabled = {okTitle === 'Update Cluster'}
            />
          </FormGroup>
          <FormGroup validationState={fields.email.error ? "error" : ""}>
            <ControlLabel>Email</ControlLabel>

            <FormControl type="text"
                         {...fields.email}
                         placeholder="Email"
            />

            <FormControl.Feedback />

            {fields.email.error && (
              <HelpBlock>{fields.email.error}</HelpBlock>
            )}
          </FormGroup>
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
          <div className="row">
          <b className="pseudo-label">Clusters Permissions</b>
          {
            _.map(clusters, (cluster, i)=> {
              if (typeof(cluster) !== 'undefined' && cluster.name !== 'all') {
                return (
                  <div>
                  <FormGroup>
                    <div className="col-md-6 buttongroup-label"><b>{cluster.name}</b></div>
                    <div className="col-md-6">
                      <ButtonToolbar key={cluster.name} className="pseudo-radio-group pulled-right">
                        <Button bsStyle="default" onClick={this.onPermissionChange.bind(this, 'admin', cluster.name)} key={1}
                                active={this.state.clustersACL[cluster.name] === 'admin'}>Admin</Button>
                        <Button className="middleButton"
                                onClick={this.onPermissionChange.bind(this, 'readOnly', cluster.name)} key={2}
                                active={this.state.clustersACL[cluster.name] === 'readOnly'}>Read Only</Button>
                        <Button onClick={this.onPermissionChange.bind(this, 'none', cluster.name)} key={3}
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
        </form>
        <div ref="error" className="text-danger text-xs-center text-error">
        </div>
      </Dialog>
    );
  }

  onPermissionChange(newI, clusterName) {
    this.setState({
      clustersACL: {
        ...this.state.clustersACL,
        [clusterName]: newI
      }
    });
  }

  // addUser() {
  //   const {create, load, fields, resetForm} = this.props;
  //
  //   return create({name: fields.name.value})
  //     .then(() => {
  //       resetForm();
  //       load();
  //       window.simpleModal.close();
  //     })
  //     .catch();
  // }
}
