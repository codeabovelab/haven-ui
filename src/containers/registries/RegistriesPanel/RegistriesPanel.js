import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {load as loadRegistries} from 'redux/modules/registries/registries';
import {DockTable, RegistriesList, StatisticsPanel} from '../../../components/index';
import {RegistryEdit} from '../../index';
import _ from 'lodash';
import {removeRegistry} from 'redux/modules/registries/registries';
import {ButtonToolbar, SplitButton, Button, MenuItem} from 'react-bootstrap';

@connect(
  state => ({
    registries: state.registries,
    registriesUI: state.registriesUI
  }), {loadRegistries, removeRegistry})

export default class RegistriesPanel extends Component {
  static propTypes = {
    registries: PropTypes.array.isRequired,
    registriesUI: PropTypes.object.isRequired,
    loadRegistries: PropTypes.func.isRequired,
    removeRegistry: PropTypes.func.isRequired
  };

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Registry Connected',
      titles: 'Registries Connected'
    }
  ];

  componentDidMount() {
    const {loadRegistries} = this.props;

    this.state = {};
    loadRegistries();

    $('.input-search').focus();
  }

  render() {
    const {loading, loadingError} = this.props.registriesUI;
    const {registries, registriesUI} = this.props;

    let rows = [...registries];
    let showLoading = false;
    let showError = false;
    let showData = false;
    let connectedRegistries = rows.length;

    return (
      <div>
        <StatisticsPanel metrics={this.statisticsMetrics} values={[connectedRegistries]}/>

        <RegistriesList loading={typeof RegistriesList === "undefined"}
                        data={rows}
                        onNewEntry={this.onActionInvoke.bind(this, "create")}
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

  additionalData(rows) {
    if (rows) {
      rows.forEach(row => {
        row.__attributes = {'data-name': row.name};
      //  row.actions = this.tdActions.bind(this);
      });
    }
  }

  onHideDialog() {
    this.setState({
      actionDialog: undefined
    });
  }

  onActionInvoke(action, registryId, event) {
    let registry;

    if (registryId) {
      registry = _.find(this.props.registries, (o) => o.name === registryId);
    }

    switch (action) {
      case "create":
        this.setState({
          actionDialog: (
            <RegistryEdit title="Create a New Registry"
                          registry={undefined}
                          onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "edit":
        this.setState({
          actionDialog: (
            <RegistryEdit title="Edit Registry"
                          registry={registry}
                          onHide={this.onHideDialog.bind(this)}
            />
          )
        });
        return;

      case "delete":
        this.setState({
          actionDialog: undefined
        });

        confirm('Are you sure you want to remove this registry?')
          .then(() => {
            this.props.removeRegistry(registryId).catch(() => null)
              .then(() => this.props.loadRegistries());
          })
          .catch(() => null);

        return;

      default:
        return;
    }
  }
}


