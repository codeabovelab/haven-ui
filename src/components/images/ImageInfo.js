import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {loadImageTagInfo} from 'redux/modules/images/images';

@connect(
  state => ({
    tagInfo: state.images.tagInfo
  }), {loadImageTagInfo})
export default class ImageInfo extends Component {
  static propTypes = {
    image: PropTypes.string.isRequired,
    tagInfo: PropTypes.object.isRequired,
    loadImageTagInfo: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.loadImageTagInfo(this.props.image);
  }

  render() {
    let imageName = this.props.image;
    let img = this.props.tagInfo[this.props.image];
    if (img && img.error) {
      return (<span>Error: <br/> {String(img.error.message || img.error)}</span>);
    }
    if (img) {
      let i = imageName.indexOf('/');
      let registry = imageName.substring(0, i);
      let name = imageName.substring(i + 1);
      return (
        <div>
          <div>
            <div>Image: {name} </div>
            {registry && (<small>from {registry}</small>)}
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
    return (<span>Loading...</span>);
  }
}
