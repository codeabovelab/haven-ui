import React, {Component, PropTypes} from 'react';
import PropertyGridLeaf from './PropertyGridLeaf';

export default class PropertyGrid extends Component {
  static propTypes = {
    data: React.PropTypes.any.isRequired,
    hideRoot: React.PropTypes.bool
  };

  render() {
    return (
      <div className="property-grid">
        <PropertyGridLeaf data={this.props.data}
                          label="root"
                          isRoot
                          hideRoot={this.props.hideRoot || true}
        />
      </div>
    );
  }
}
