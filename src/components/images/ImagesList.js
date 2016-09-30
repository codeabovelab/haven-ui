import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {DockTable, OnOff, Chain, ImageInfo, NodeInfo} from '../index';
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
      sortable: true,
      render: (img) => {
        let registry = img.registry;
        if (registry == null) return "[no registry]";
        if (registry === "") return "[docker hub]";
        return registry;
      }
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
        let popoverRender = (img) => (
          <Popover id="image-info-popover">
            <ImageInfo imageName={img.tags.length ? (image.name + ":" + img.tags[0]) : null} imageId={img.id} />
          </Popover>
        );
        let title = (img) => `id: ${img.id}\nname: ${img.tags.map(tag => image.name + ":" + tag)}`;
        return (
          <td key="tags">
            <Chain data={image.ids || []}
              popoverPlacement="right"
              popoverRender={popoverRender}
              render={(img) => (<span title={title(img)}>{String(img.tags) || "[untagged]"}</span>)}
            />
          </td>
        );
      }
    },
    {
      name: 'nodes',
      label: 'Nodes',
      width: '20%',
      render: (image) => {
        let data = image.ids || [];
        if (data.length) {
          data = data.map(img => img.nodes)
            .reduce((a, b) => a.concat(b))
            .sort()
            .reduce((a, b) => {if (a[a.length - 1] !== b) a.push(b); return a;}, []);
        }
        return (<td key="nodes">
          <Chain data={data}
            popoverPlacement="right"
            popoverRender={(node) => (<Popover id="node-info-popover"><NodeInfo node={node} /></Popover>)}
          />
        </td>);
      }
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

