import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog} from 'components';
import {reduxForm, SubmissionError} from 'redux-form';
import {updateContainer, loadDetails} from 'redux/modules/containers/containers';
import _ from 'lodash';

const MAIN_FIELDS = {
  cpuShares: {
    type: 'integer',
    label: 'CPU shares',
    min: 2,
    description: "Default is 1024"
  },
  cpusetCpus: {
    label: 'CPU SET CPUS',
    description: "CPUs in which to allow execution (0-3, 0,1)"
  },
  cpusetMems: {
    type: 'string',
    label: 'CPU SET MEMS',
    description: 'Memory nodes (MEMs) in which to allow execution (0-3, 0,1).'
  },
  cpuPeriod: {
    type: 'integer',
    label: 'CPU Period',
    description: 'Limit the CPU CFS (Completely Fair Scheduler) period'
  },
  cpuQuota: {
    type: 'integer',
    label: 'CPU Quota',
    min: 0,
    description: "100 000 means 100% of 1 CPU. 0 also means 100% of 1 CPU."
  },
  blkioWeight: {
    type: 'integer',
    label: 'Blkio Weight',
    min: 2,
    max: 1000,
    description: "Default is 500"
  },
  memoryLimit: {
    type: 'integer',
    label: 'Memory limit',
    measurement: 'bytes',
    description: 'A positive integer (Mb).'
  },
  kernelMemory: {
    type: 'integer',
    label: 'Kernel Memory',
    measurement: 'bytes',
    description: 'A positive integer (Mb).'
  },
  memoryReservation: {
    type: 'integer',
    label: 'Memory Reservation',
    measurement: 'bytes',
    description: 'Memory soft limit. A positive integer (Mb).'
  },
  memorySwap: {
    type: 'integer',
    label: 'Memory Swap',
    measurement: 'bytes',
    description: 'Total memory limit. A positive integer (Mb).'
  }
};
const MAIN_FIELDS_KEYS = Object.keys(MAIN_FIELDS);
const ALL_FIELDS_KEYS = ['restart', 'restartRetries'].concat(MAIN_FIELDS_KEYS);

function updateFields(response, fields) {
  let allFields = _.merge(MAIN_FIELDS, {'restart': null, 'restartRetries': null});
  for (let field in allFields) {
    if (!allFields.hasOwnProperty(field)) {
      continue;
    }
    let value = response[field] !== 'null' ? response[field] : '';
    if (value && allFields[field].measurement && allFields[field].measurement === 'bytes') {
      value = bytesToMb(value);
    }
    fields[field].onChange(value);
  }
}

function bytesToMb(value) {
  return value / 1048576;
}

function mbToBytes(value) {
  return value * 1048576;
}

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
  containersUI: state.containersUI
}), {updateContainer, loadDetails})
@reduxForm({
  form: 'updateContainer',
  fields: ALL_FIELDS_KEYS
})
export default class ContainerUpdate extends Component {
  static propTypes = {
    clusters: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    containers: PropTypes.object,
    containersUI: PropTypes.object,
    updateContainer: PropTypes.func.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func,
    resetForm: PropTypes.func.isRequired,
    loadDetails: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,

    onHide: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      creationLogVisible: ''
    };
  }

  componentWillMount() {
    const {loadDetails, container, fields} = this.props;
    _.each(fields, function loopFields(value, key) {
      if (MAIN_FIELDS[key] && MAIN_FIELDS[key].defaultValue) {
        fields[key].onChange(MAIN_FIELDS[key].defaultValue);
      }
    });
    loadDetails(container).then((response)=> {
      updateFields(response, fields);
    }).catch(()=>null);
  }

  onSubmit() {
    const {fields, updateContainer, loadDetails, container} = this.props;
    let containerUpdData = {};
    let fieldValue = '';
    MAIN_FIELDS_KEYS.forEach(key => {
      fieldValue = fields[key].value !== 'null' ? fields[key].value : '';
      if (fieldValue && MAIN_FIELDS[key].measurement === 'bytes') {
        fieldValue = mbToBytes(fieldValue);
      }
      containerUpdData[key] = fieldValue;
    });
    containerUpdData.restart = this.getRestart();
    let $logBlock = $('#creation-log-block');
    let $spinner = $logBlock.find('i');
    let $logArea = $('#creation-log');
    $logBlock.show();
    $logArea.val('');
    this.setState({
      creationLogVisible: true
    });
    $spinner.show();
    return updateContainer(container, containerUpdData)
      .then((response) => {
        let msg = (response._res.text && response._res.text.length > 0) ? response._res.text : "No response message";
        $logArea.val(msg);
        $spinner.hide();
        loadDetails(container).then((response)=> {
          updateFields(response, fields);
        }).catch(()=>null);
      }).catch((response) => {
        $spinner.hide();
        let msg = (response.message && response.message.length > 0) ? response.message : "No response message";
        $logArea.val(msg);
        throw new SubmissionError(response.message);
      });
  }

  render() {
    const {fields, container} = this.props;
    const creationLogVisible = this.state.creationLogVisible;

    return (
      <Dialog show
              size="large"
              title={"Update Container " + container.name}
              onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}
              onHide={this.props.onHide}
              okTitle={creationLogVisible ? "Again" : "Update Container"}
      >
        <form>
          <div className="row">
            {MAIN_FIELDS_KEYS.map(key =>
              <div className="col-md-6" key={key}>
                {fieldComponent(key)}
              </div>
            )}
            {this.fieldRestart()}
          </div>
          <div className="form-group" id="creation-log-block">
            <label>Update Log: <i className="fa fa-spinner fa-2x fa-pulse"/></label>
            <textarea readOnly
                      className="container-creation-log"
                      defaultValue="Updating Container..."
                      id="creation-log"
            />
          </div>
        </form>
      </Dialog>
    );

    function fieldComponent(name) {
      let property = MAIN_FIELDS[name];
      let field = fields[name];
      return (
        <div className="form-group" id="containerUpdateInputs">
          <label>{property.label}:</label>
          {field.error && field.touched && <div className="text-danger">{field.error}</div>}
          {inputField(property, field)}
          {property.description && <small className="text-muted">{property.description}</small>}
        </div>
      );
    }

    function inputField(property, field) {
      switch (property.type) {
        case 'integer':
          return inputNumber(property, field);
        default:
          return inputText(property, field);
      }
    }

    function inputText(property, field) {
      return <input type="text" {...field} className="form-control"/>;
    }

    function inputNumber(property, field) {
      let props = Object.assign({}, field, _.pick(property, ['min', 'max']));
      return <input type="number" step="1" {...props} className="form-control"/>;
    }
  }

  fieldRestart() {
    let {fields: {restart, restartRetries}} = this.props;
    let values = ['no', 'on-failure', 'always', 'unless-stopped'];
    return (
      <div className="form-group">
        <div className="col-md-6">
          <label>Restart policy:</label>
          <div className="field-body">
            <select className="form-control" {...restart}>
              {values.map(value =>
                <option key={value} value={value}>{value}</option>
              )}
            </select>
          </div>
        </div>
        {(restart.value === "on-failure") && <div className="col-md-6">
          <label>Max retries:</label>
          <input {...restartRetries} type="number" step="1" min="0"
                 className="form-control" placeholder="max retries"/>
        </div>}
      </div>
    );
  }

  getRestart() {
    let {fields: {restart, restartRetries}} = this.props;
    let value = restart.value;
    if (restart.value === "on-failure" && restartRetries.value) {
      value += `[:${restartRetries.value}]`;
    }
    return value;
  }
}


