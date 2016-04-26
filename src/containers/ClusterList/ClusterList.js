import React, {Component, PropTypes} from 'react';
import {isLoaded, load, create} from 'redux/modules/clusterList';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { Link } from 'react-router';
import {bindActionCreators} from 'redux';
import {reduxForm} from 'redux-form';

@connect(
  state => ({
    clusterList: state.clusterList.data,
    error: state.clusterList.error,
    loading: state.clusterList.loading
  }), dispatch => bindActionCreators({create, load}, dispatch))
@reduxForm({
  form: 'newCluster',
  fields: ['env', 'name']
})
export default class ClusterList extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    clusterList: PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
    create: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {load} = this.props; // eslint-disable-line no-shadow
    load();
  }

  render() {
    const {
      fields,
      clusterList, create, load, resetForm // eslint-disable-line no-shadow
      } = this.props; // eslint-disable-line no-shadow


    function handleCreate() {
      let name = fields.name.value;
      let env = fields.env.value;
      create({name, env})
        .then(() => {
          resetForm();
          fields.name.value = '';
          fields.env.value = '';
          $('#newCluster').modal('hide');
          return load();
        });
    }

    function showModal() {
      $('#newCluster').modal('show');
      $('#env').focus();
    }


    return (
      <div className="container-fluid">
        <h1>Cluster List</h1>
        <div className="page-info-group">
          # of Clusters: <strong>{clusterList && clusterList.length}</strong>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={showModal}><i
            className="fa fa-plus"></i> New Cluster
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
            <tr>
              <th>Cluster Name</th>
              <th>Environment</th>
              <th># of Containers</th>
              <th># of Nodes</th>
            </tr>
            </thead>
            <tbody>
            {clusterList && clusterList.map(cluster =>
              <tr key={cluster.name}>
                <td>
                  <Link to={"/cluster/" + cluster.name}>{cluster.name}</Link>
                </td>
                <td>{cluster.environment}</td>
                <td>{cluster.containers}</td>
                <td>{cluster.nodes}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div id="newCluster" className="modal">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title">Create New Cluster</h4>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label>Environment</label>
                    <input id="env" type="text" {...fields.env} className="form-control"/>
                  </div>
                  <div>
                    <label>Cluster name</label>
                    <input type="text" {...fields.name} className="form-control"/>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary" onClick={handleCreate}>Create New Cluster</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
