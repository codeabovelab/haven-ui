import React, {Component, PropTypes} from 'react';
import {getService} from 'redux/modules/services/services';
import {Dialog, PropertyGrid} from 'components';
import {connect} from 'react-redux';
import _ from 'lodash';

@connect(
  state => ({
    services: state.services,
  }),
  {getService})
export default class ServiceDetails extends Component {
  static propTypes = {
    services: PropTypes.object.isRequired,
    cluster: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    getService: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {serviceId, cluster, getService} = this.props;
    getService(cluster, serviceId);
  }

  render() {
    const {serviceId, services, cluster} = this.props;
    let loading = _.get(services, `[${cluster}][${serviceId}].loading`, false);
    let service = _.get(services, `[${cluster}][${serviceId}]`, {});
    return (
      <Dialog show
              hideCancel
              size="large"
              title={`Service Details: ${service.name}`}
              okTitle="Close"
              onSubmit={this.props.onHide}
              onHide={this.props.onHide}
      >
        {loading && (
          <div className="text-xs-center">
            <i className="fa fa-spinner fa-5x fa-pulse"/>
          </div>
        )}

        {!loading && (
          <PropertyGrid data={service} />
        )}
      </Dialog>
    );
  }
}
