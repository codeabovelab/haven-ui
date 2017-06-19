import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {ActionMenu, DockTable, OnOff, Chain, ImageInfo, NodeInfo} from '../index';
import {Label, Badge, ButtonToolbar, DropdownButton, MenuItem, Panel, Popover, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class ImagesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.bool
  };

  COLUMNS = [
    {
      name: 'registry',
      label: 'Registry Address',
      width: '5%',
      sortable: true,
      render: (img) => {
        let registry = img.registry;
        if (registry == null) registry = "no registry";
        if (registry === "") registry = "docker hub";
        return (
          <td key="registry">
            <span>{registry}</span>
          </td>
        );
      }
    },
    {
      name: 'name',
      label: 'Image Name',
      width: '15%',
      sortable: true,
      render: (img) => {
        let name = img.name || '';
        let title = name ? name : '';
        let match = name.match(/[^/]+$/);
        name = match && match[0] ? match[0] : name;
        const MAX_LENGTH = 25;
        if (name) {
          if (name.length >= MAX_LENGTH) {
            name = '...' + name.substring(name.length - MAX_LENGTH, name.length);
          }
        }
        return (
          <td key="name">
            <span title={title}>{name}</span>
          </td>
        );
      }
    },
    {
      name: 'tags',
      label: 'Downloaded Tags',
      width: '25%',
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
      width: '16%',
      render: (image) => {
        let data = image.nodes;
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
      width: '5%',
      render: (image) => {
        let actions = this.props.actions;
        return (<td key="actions" className="td-actions">
          <ActionMenu subject={image}
                    actions={actions.list}
                    actionHandler={actions.handler}
                    title="Delete"
          />
        </td>);
      }
    }
  ];

  render() {
    const GROUP_BY_SELECT = ['registry', 'name'];

    return (
      <Panel>
        {this.props.loading && (
        <ProgressBar active now={100} />
        )}
      {(this.props.data && !this.props.loading) && (
        <DockTable columns={this.COLUMNS}
                   rows={this.props.data}
                   groupBy="registry"
                   groupBySelect={GROUP_BY_SELECT}
                   hideGroupColumn
                   nullDisplayName="Detached Images"
                   emptyDisplayName="Docker Hub"
                  />
      )}
      {this.props.data && this.props.data.length === 0 && (
        <div className="alert alert-no-results">
          No Images yet
        </div>
      )}
      </Panel>
    );
  }
}

