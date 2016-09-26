import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {DockTable, OnOff, Chain, ImageInfo} from '../index';
import {deleteImages} from 'redux/modules/images/images';
import {Label, Badge, ButtonToolbar, DropdownButton, MenuItem, Panel, Popover, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

@connect(state => ({}), {deleteImages})
export default class ImagesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    deleteImages: PropTypes.func.isRequired,
    loading: PropTypes.bool
  };

  COLUMNS = [
    {
      name: 'registry',
      label: 'Registry Address',
      width: '0%',
      sortable: true
    },
    {
      name: 'name',
      label: 'Image Name',
      width: '50%',
      sortable: true
    },
    {
      name: 'tags',
      label: 'Downloaded Tags',
      width: '20%',
      render: (image) => {
        let popoverRender = (tag) => (
          <Popover id="image-info-popover">
            <ImageInfo image={image.name + ":" + tag} />
          </Popover>
        );
        return (
          <td key="tags">
            <Chain data={image.tags} popoverPlacement="right" popoverRender={popoverRender}/>
          </td>
        );
      }
    },
    {
      name: 'nodes',
      label: 'Nodes',
      width: '20%',
      render: (image) => (<td key="nodes"><Chain data={image.nodes}/></td>)
    },
    {
      name: 'Actions',
      width: '10%',
      render: (image) => this.actionsRender(image)//it hold 'this'
    }
  ];

  render() {
    const GROUP_BY_SELECT = ['registry', 'name'];

    const panelHeader = (
      <div className="clearfix">
        <h3>Image List</h3>
      </div>
    );

    return (
      <Panel header={panelHeader}>
        {this.props.loading && (
        <ProgressBar active now={100} />
        )}
      {(this.props.data && !this.props.loading) && (
        <DockTable columns={this.COLUMNS}
                  rows={this.props.data}
                  groupBy="registry"
                  groupBySelect={GROUP_BY_SELECT}
                  hideGroupColumn
                  />
      )}
      {this.props.data && this.props.data.length === 0 && (
        <div className="alert alert-info">
          No Images yet
        </div>
      )}
      </Panel>
    );
  }

  actionsRender(image) {
    let deleteImages = this.props.deleteImages;
    let deleteFactory = (arg) => {
      return () => {
        confirm('Are you sure you want to remove image:' + image.name + ' ?')
          .then(() => {
            deleteImages({
              ...arg,
              nodes: image.nodes,
              name: image.name
            });
            //TODO reload images
          });
      };
    };
    return (
      <td key="actions" className="td-actions">
        <ButtonToolbar bsStyle="default">
          <DropdownButton bsStyle="info" title="Delete" id={"delete_" + image.name}>
            <MenuItem onSelect={deleteFactory()} >
              Delete<br/><small>from nodes</small>
            </MenuItem>
            <MenuItem onSelect={deleteFactory({fromRegistry: true})} >
              Delete<br/><small>from everywhere</small>
            </MenuItem>
            <MenuItem onSelect={deleteFactory({fromRegistry: true, retainLast: 2/*'last' and prev. tag*/})} >
              Delete<br/><small>from everywhere except last</small>
            </MenuItem>
          </DropdownButton>
        </ButtonToolbar>
      </td>
    );
  }
}

