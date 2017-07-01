import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {DockTable, Chain, StatisticsPanel, NavContainer} from '../../../components/index';
import {Link, RouteHandler} from 'react-router';
import {getDeployedImages} from 'redux/modules/images/images';
import {updateContainers} from 'redux/modules/containers/containers';
import {FormGroup, InputGroup, FormControl, ControlLabel, Button, ProgressBar, Popover, Modal, OverlayTrigger} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';
import Helmet from 'react-helmet';

let clusterImagesMounted = null;

@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    images: state.images
  }), {getDeployedImages, updateContainers})
export default class ClusterImages extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    events: PropTypes.object,
    images: PropTypes.object,
    params: PropTypes.object,
    getDeployedImages: PropTypes.func.isRequired,
    updateContainers: PropTypes.func.isRequired
  };

  COLUMNS = [
    {
      name: 'select',
      width: '1%',
      render: this.checkRender.bind(this)
    },

    {
      name: 'name',
      width: '24%'
    },

    {
      name: 'Current Tag',
      width: '15%',
      render: this.currentTagRender
    },

    {
      name: 'containers',
      render: this.containersRender,
      width: '45%'
    },

    {
      name: 'tags',
      render: this.tagsRender.bind(this),
      width: '15%'
    },

  ];

  UPDATE_STRATEGIES = [
    {
      value: "ui.updateContainers.stopThenStartEach",
      label: "Stop then start each"
    },
    {
      value: "ui.updateContainers.startThenStopEach",
      label: "Start then stop each"
    },
    {
      value: "ui.updateContainers.stopThenStartAll",
      label: "Stop then start all"
    }
  ];

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Image Running',
      titles: 'Images Running'
    }
  ];

  constructor(...params) {
    super(...params);
    this.state = {
      tagsSelected: {},
      containersToUpdate: [],
      containersExcluded: {},
      imagesToUpdate: {},
      showConfirmModal: false,
      showModal: false,
      updateStrategy: this.UPDATE_STRATEGIES[0].value,
      updatePercents: 100,
      updateResponse: {message: "", status: ""},
      schedule: '',
      jobTitle: '',
      wildCard: false,
      wildCardImages: '',
      wildCardVersion: '',
    };
    this.getRows = this.getRows.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.submitConfirmModal = this.submitConfirmModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  componentDidMount() {
    const {getDeployedImages, params: {name}} = this.props;
    clusterImagesMounted = true;
    getDeployedImages(name).then(() => {
      const {deployedImages} = this.props.images;
      const clustersImages = _.get(deployedImages, name, []);
      clustersImages.map(el => {
        if (el.name) {
          let key = getFullImageName(el);
          let tags = _.get(el, 'tags', []);
          let lastTag = tags[tags.length - 1];
          if (clusterImagesMounted) {
            this.setState({
              tagsSelected: {
                ...this.state.tagsSelected,
                [key]: lastTag
              }
            });
          }
        }
      });
    });
  }

  componentWillUnmount() {
    clusterImagesMounted = false;
  }

  containersRender(row) {
    let chainContainers = row.containers;
    let popoverRender = (el) => (
      <Popover id={el.id}>
        <span>Node: {shortenName(el.node) || ''}</span>
        <br></br>
        <span>Id: {shortenName(el.id) || ''}</span>
      </Popover>
    );

    return (
      <td key="containers">
        <Chain data={chainContainers}
               popoverPlacement="top"
               popoverRender={popoverRender}
               render={(container) => (<span title={String(container.name) || ""}>{String(container.name) || ""}</span>)}
        />
      </td>
    );
  }

  currentTagRender(row) {
    let currentTag = _.get(row, 'currentTag', '');
    return (
      <td key="currentTag">
        <span>{currentTag}</span>
      </td>
    );
  }

  tagsRender(row) {
    let tagsOptions;
    const key = row.registry.trim().length > 0 ? row.registry + '/' + row.name : row.name;
    tagsOptions = row.tags && row.tags.map(tag => {
      return {value: tag, label: tag};
    });
    let disabled = !tagsOptions || tagsOptions.length === 0;
    return (
      <td key="tags" className="react-select-td" title={disabled ? "No tags available" : ""}>
        <Select value={this.state.tagsSelected[key]}
                options={tagsOptions}
                placeholder = ""
                disabled={disabled}
                clearable={false}
                searchable
                onChange={handleChange.bind(this, key)}
        />
      </td>
    );
    function handleChange(id, event) {
      let value = event.target ? event.target.value : event.value;
      this.setState({
        tagsSelected: {
          ...this.state.tagsSelected,
          [id]: value
        }
      });
    }
  }

  closeModal(modalId) {
    this.setState({ [modalId]: false });
  }

  openModal(modalId) {
    this.setState({ [modalId]: true });
  }

  checkRender(row) {
    const popoverTop = (
      <Popover id={"pop" + row.name}>
        <strong>Update available!</strong>
      </Popover>
    );
    let checkBoxName = row.registry.trim().length > 0 ? row.registry + '/' + row.name : row.name;
    return (
      <td key="select" className="checkbox-td">
        <OverlayTrigger trigger={checkUpdateAvailability(row) ? ['hover', 'focus'] : []} placement="right" overlay={popoverTop}>
          <div className="select-update-block">
            <input type="checkbox"
                   title={row.tags.length === 0 ? 'No tags found' : ''}
                   key={checkBoxName}
                   className="checkbox-control"
                   defaultChecked={false}
                   disabled={!row.name || row.tags.length === 0}
                   checked={this.state.imagesToUpdate[checkBoxName]}
                   name={checkBoxName}
                   onChange={this.toggleCheckbox.bind(this)}
            />
          </div>
        </OverlayTrigger>
      </td>
    );
  }

  toggleCheckbox(e) {
    let checked = e.target.checked;
    let name = e.target.name;
    this.setState({
      imagesToUpdate: {...this.state.imagesToUpdate, [name]: checked}
    });
  }

  toggleContainerCheckbox(e) {
    let checked = e.target.checked;
    let name = e.target.name;
    this.setState({
      containersExcluded: $.extend(this.state.containersExcluded, {[name]: {checked: checked}})
    });
  }

  handleWildcardChange() {
    let $updateBlock = $("#clusterImages");
    $updateBlock.toggleClass('no-header-panel');
    this.setState({
      wildCard: !this.state.wildCard
    });
  }

  handleSelectChange(id, event) {
    let value = event.target ? event.target.value : event.value;
    if (id === 'updatePercents') {
      if (value > 100) {
        value = 100;
      }
      if (value < 0) {
        value = 10;
      }
    }
    this.setState({
      [id]: value
    });
  }

  handlePercentsChange(id, event) {
    this.setState({
      updatePercents: id
    });
  }

  generateJobTitle(title, wildCard, imagesToUpdate = []) {
    let resultTitle = title;
    if (title === '') {
      resultTitle = 'Update_';
      switch (wildCard) {
        case true:
          resultTitle += this.state.wildCardImages + '_' + this.state.wildCardVersion + '_';
          break;
        case false:
          _.map(imagesToUpdate, (el, key) => {
            if (imagesToUpdate[key]) {
              resultTitle += imagesToUpdate[key].name + '_';
            }
          });
          break;
        default:
          break;
      }
      resultTitle += Math.floor(Date.now() / 1000);
    }
    return resultTitle;
  }

  onSubmit() {
    const strategy = this.state.updateStrategy;
    const wildCard = this.state.wildCard;
    const images = this.getImages();

    if (wildCard) {
      const title = this.generateJobTitle(title, true);
      this.safeUpdateContainers(strategy, this.state.updatePercents, this.state.schedule, title, images);
    } else {
      if (images.images.length > 0) {
        this.getContainersList(images);
        this.openModal('showConfirmModal');
      } else {
        this.setState({updateResponse: {message: 'Select tags for chosen images to create update job.'}});
        this.openModal('showModal');
      }
    }
  }

  getImages() {
    const tags = this.state.tagsSelected;
    let images = {images: []};
    const imagesToUpdate = this.state.imagesToUpdate;
    const wildCard = this.state.wildCard;
    if (wildCard) {
      images.images.push({name: this.state.wildCardImages, to: this.state.wildCardVersion});
    } else {
      _.map(imagesToUpdate, (el, key) => {
        let updateTo = tags[key];
        if (key && el && updateTo) {
          images.images.push({name: key, to: updateTo});
        }
      });
    }
    return images;
  }

  checkIfAllExcluded() {
    let excludedNumber = 0;
    const allContainersNumber = this.state.containersToUpdate.length;
    _.forEach(this.state.containersExcluded, (value, key) => {
      if (!value.checked) {
        excludedNumber += 1;
      }
    });
    return allContainersNumber === excludedNumber;
  }

  submitConfirmModal() {
    let images = this.getImages();
    const title = this.generateJobTitle(this.state.jobTitle, false, images.images);
    let excluded = {containers: []};
    _.forEach(this.state.containersExcluded, (value, key) => {
      if (!value.checked) {
        excluded.containers.push(key);
      }
    });
    if (excluded.containers.length > 0) {
      images.excluded = excluded;
    }
    this.closeModal('showConfirmModal');
    this.safeUpdateContainers(this.state.updateStrategy, this.state.updatePercents, this.state.schedule, title, images);
  }

  safeUpdateContainers(strategy, updatePercents, schedule, jobTitle, images) {
    const {params: {name}, updateContainers} = this.props;
    updateContainers(name, strategy, updatePercents, schedule, jobTitle, images).then((response)=> {
      this.showResponse(response);
      this.setState({imagesToUpdate: {}});
    }).catch((response) => {
      this.showResponse(response);
    });
  }

  getContainersList(images) {
    const rowsUpdated = this.getRows();
    let rowsFiltered = [];
    let containersUpdated = [];
    _.forEach(images.images, (value, key) => {
      rowsFiltered = _.concat(rowsFiltered, _.filter(rowsUpdated, (row) => {
        return getFullImageName(row) === value.name;
      }));
    });
    _.forEach(rowsFiltered, (value, key) => {
      containersUpdated = _.concat(containersUpdated, value.containers);
    });
    this.setState({
      containersToUpdate: containersUpdated
    });
    return containersUpdated;
  }

  getRows() {
    const {images, params: {name}} = this.props;
    return _.get(images, `deployedImages.${name}`, []).map((row)=> {
      if (checkUpdateAvailability(row)) {
        row.trColor = 'availableToUpdate';
      }
      return row;
    });
  }

  showResponse(response) {
    let message = 'Error';
    let status = '';
    status = response.code || response._res.status || response._res.code;
    if (status) {
      switch (status) {
        case 200:
          //full message for status "200" filled in modal's body
          message = response.id;
          break;
        default:
          message = 'Failed to create the Update job. Error message is: ' + response.message || response._res.message;
      }
    }
    this.setState({updateResponse: {message: message, status: status}});
    this.openModal('showModal');
  }

  render() {
    require('./ClusterImages.scss');
    require('react-select/dist/react-select.css');
    let $searchInput = $('.input-search')[0];
    $($searchInput).addClass('pseudo-label');
    const {params: {name}, images} = this.props;
    const wildCard = this.state.wildCard;
    let rows = this.getRows();
    const imagesToUpdate = this.state.imagesToUpdate;
    let disabledUpdateButton = true;
    if (wildCard) {
      disabledUpdateButton = !(this.state.wildCardImages && this.state.wildCardVersion);
    } else {
      _.map(imagesToUpdate, (el, key) => {
        if (imagesToUpdate[key]) {
          disabledUpdateButton = false;
          return false;
        }
      });
    }

    return (
      <div key={name}>
        <Helmet title="Update"/>
        {rows && (
          <StatisticsPanel metrics={this.statisticsMetrics}
                           values={[rows.length]}
          />
        )}
        <div className="panel panel-default">
            <div>
              <NavContainer clusterName={name}/>
              <div id="clusterImages">
                <form>
                  <div className="col-md-6">
                    <FormGroup>
                      <ControlLabel>Update Strategy</ControlLabel>
                      <FormControl componentClass="select" id="updateStrategy" value={this.state.updateStrategy}
                                   onChange={this.handleSelectChange.bind(this, 'updateStrategy')}>
                        {
                          this.UPDATE_STRATEGIES.map((el, i) => {
                            return <option key={i} value={el.value}>{el.label}</option>;
                          })
                        }
                      </FormControl>
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Schedule</ControlLabel>
                      <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'schedule')}
                                   placeholder="'0 0 * * * *' = the top of every hour of every day"/>
                    </FormGroup>
                  </div>
                  <div className="col-md-6">
                    <div className="row">
                      <div className="col-md-6">
                        <FormGroup>
                          <ControlLabel>Job Title</ControlLabel>
                          <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'jobTitle')}/>
                        </FormGroup>
                      </div>
                      <div className="col-md-6">
                        <FormGroup>
                          <Button active={wildCard} bsStyle={wildCard ? "primary" : "default"}
                                  className="pulled-down-button"
                                  onClick={this.handleWildcardChange.bind(this)}>
                            Wildcard
                          </Button>
                          <Button bsStyle="primary" onClick={this.onSubmit.bind(this)}
                                  disabled={disabledUpdateButton}
                                  className="pulled-down-button pulled-right"
                                  title={disabledUpdateButton ? "Choose containers to update" : ""}>
                            <i className="fa fa-arrow-up"/>&nbsp;Update Containers
                          </Button>
                        </FormGroup>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <FormGroup>
                          <label>Percentage of Containers to Update:</label>
                          <InputGroup>
                            <FormControl type="number" step="10" max="100" min="10" id="updatePercents"
                                         value={this.state.updatePercents}
                                         onChange={this.handleSelectChange.bind(this, 'updatePercents')}/>
                            <InputGroup.Addon>%</InputGroup.Addon>
                          </InputGroup>
                        </FormGroup>
                      </div>
                      <div className="col-ms-6">
                        <FormGroup>
                          <Button className="pulled-down-button pseudo-label"
                                  onClick={this.handlePercentsChange.bind(this, '30')}>
                            30%
                          </Button>&nbsp;
                          <Button className="pulled-down-button"
                                  onClick={this.handlePercentsChange.bind(this, '40')}>
                            40%
                          </Button>&nbsp;
                          <Button className="pulled-down-button"
                                  onClick={this.handlePercentsChange.bind(this, '50')}>
                            50%
                          </Button>
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </form>
                {(!wildCard && rows) && (
                  <DockTable columns={this.COLUMNS}
                             rows={rows}
                             key={name}
                  />
                ) || (
                  <div>
                    <div className="col-md-6">
                      <FormGroup required>
                        <ControlLabel>Wildcard Images</ControlLabel>
                        <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'wildCardImages')}
                                     value={this.state.wildCardImages}
                                     placeholder="ni1.codeabolab.com/*"/>
                      </FormGroup>
                    </div>
                    <div className="col-md-6">
                      <FormGroup required>
                        <ControlLabel>Wildcard Target Version</ControlLabel>
                        <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'wildCardVersion')}
                                     placeholder="*latest"
                                     value={this.state.wildCardVersion}/>
                      </FormGroup>
                    </div>
                    &nbsp;
                  </div>
                )}
              </div>
            </div>
          {(images.loadingDeployed && rows.length === 0) && (
            <div className="progressBarBlock">
              <ProgressBar active now={100}/>
            </div>
          )}
          {(rows.length === 0 && !images.loadingDeployed) && (
            <div className="alert alert-no-results">
              No images yet
            </div>
          )}
        </div>
        {/*Modal with containers list to exclude unwanted*/}
        <Modal show={this.state.showConfirmModal} onHide={() => this.closeModal('showConfirmModal')}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm containers update</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="checkbox-list check-containers-block">
              {
                this.state.containersToUpdate.map(function list(container, i) {
                  if (typeof(container) !== 'undefined') {
                    return (<div className="checkbox-button" key={i}><label>
                      <input type="checkbox"
                             className="checkbox-control registry-checkbox"
                             value={container.id}
                             defaultChecked
                             onChange={this.toggleContainerCheckbox.bind(this)}
                             name={container.id}
                      />
                      <span className="checkbox-label">{container.name}</span>
                    </label></div>);
                  }
                }.bind(this))
              }
            </div>
            <p className="checkboxesHint">*Unselect containers, that you don't want to update</p>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" disabled={this.checkIfAllExcluded()} onClick={this.submitConfirmModal}>Confirm Update</Button>
            <Button onClick={() => this.closeModal('showConfirmModal')}>Close</Button>
          </Modal.Footer>
        </Modal>
        {/*Modal, containing job response message*/}
        <Modal show={this.state.showModal} onHide={() => this.closeModal('showModal')}>
          <Modal.Header closeButton>
            <Modal.Title>Update Info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.updateResponse.status === 200 && (
              <p>The Update job is successfully created. Please check the&nbsp;
                <Link to={"/jobs/" + this.state.updateResponse.message}>Jobs page</Link> for its status.
              </p>
            ) || (
              <p>{this.state.updateResponse.message}</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.closeModal('showModal')}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

function shortenName(name) {
  let result = String(name);
  const MAX_LENGTH = 25;
  if (name.length > MAX_LENGTH) {
    result = name.substr(0, MAX_LENGTH) + '...';
  }
  return result;
}

function checkUpdateAvailability(row) {
  const tags = _.get(row, 'tags', []);
  const lastTag = tags[tags.length - 1];
  const preLastTag = tags[tags.length - 2];
  let updateAvailable = false;
  if (lastTag) {
    if (lastTag === 'latest' && preLastTag) {
      updateAvailable = (preLastTag !== row.currentTag) && (lastTag !== row.currentTag);
    } else {
      updateAvailable = lastTag !== row.currentTag;
    }
  }
  return updateAvailable;
}

function getFullImageName(row) {
  return (row.registry && row.registry.trim().length > 0) ? row.registry + '/' + row.name : row.name;
}
