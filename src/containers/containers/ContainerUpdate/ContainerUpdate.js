import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Dialog} from 'components';
import {reduxForm, SubmissionError} from 'redux-form';
import {updateContainer, loadDetails} from 'redux/modules/containers/containers';
import _ from 'lodash';

const FIELDS = {
  cpuShares: {
    type: 'integer',
    label: 'CPU shares'
  },
  memory: {
    label: 'Memory limit'
  },
  kernelMemory: {
    label: 'Kernel Memory',
    type: 'integer'
  },
  memoryReservation: {
    label: 'Memory Reservation',
    type: 'integer'
  },
  cpusetCpus: {
    label: 'CPU SET CPUS'
  },
  cpusetMems: {
    label: 'CPU SET MEMS'
  },
  cpuPeriod: {
    label: 'CPU Period'
  },
  cpuQuota: {
    type: 'integer',
    label: 'CPU quota',
    min: 0,
    description: "100 000 means 100% of 1 CPU. 0 also means 100% of 1 CPU."
  },
  blkioWeight: {
    type: 'integer',
    label: 'Blkio Weight'
  }
};

function updateFields(response, fields) {
  for (let field in FIELDS) {
    if (!FIELDS.hasOwnProperty(field)) {
      continue;
    }
    let value = response[field] !== 'null' ? response[field] : '';
    fields[field].onChange(value);
  }
}

const FIELDS_KEYS = Object.keys(FIELDS);

@connect(state => ({
  clusters: state.clusters,
  containers: state.containers,
  containersUI: state.containersUI
}), {updateContainer, loadDetails})
@reduxForm({
  form: 'updateContainer',
  fields: FIELDS_KEYS
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
    loadDetails(container).then((response)=> {
      updateFields(response, fields);
    }).catch(()=>null);
  }

  onSubmit() {
    const {fields, updateContainer, loadDetails, container} = this.props;
    let containerUpdData = {};
    let fieldValue = '';
    FIELDS_KEYS.forEach(key => {
      fieldValue = fields[key].value !== 'null' ? fields[key].value : '';
      containerUpdData[key] = fieldValue;
    });
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
        $logArea.val(response._res.text);
        $spinner.hide();
        loadDetails(container).then((response)=> {
          updateFields(response, fields);
        }).catch(()=>null);
      }).catch((response) => {
        $spinner.hide();
        $logArea.val(response.message);
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
            {FIELDS_KEYS.map(key =>
              <div className="col-md-6" key={key}>
                {fieldComponent(key)}
              </div>
            )}
          </div>
          <div className="form-group" id="creation-log-block">
            <label>Update Log: <i className="fa fa-spinner fa-2x fa-pulse"/></label>
            <textarea readOnly
                      className="container-creation-log"
                      defaultValue=""
                      id="creation-log"
            />
          </div>
        </form>
      </Dialog>
    );

    function fieldComponent(name) {
      let property = FIELDS[name];
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
}


