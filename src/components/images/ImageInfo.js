import React, {Component, PropTypes} from 'react';

export default class ImageInfo extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  };

  render() {
    let img = this.props.data;
    return (
      <div>
        <div>
          <div>Image: {img.name}:{img.tag} </div>
          {img.registry && (<small>from {img.registry}</small>)}
        </div>
        <div>
          <p>Created: {window.TimeUtils.format(img.created)}</p>
          Labels:
          <ul className="list-group">
            {img.labels && Object.keys(img.labels).map((key) => (
              <li key={key} className="list-group-item">{key} = {img.labels[key]}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
