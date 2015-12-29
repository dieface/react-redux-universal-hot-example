/*eslint-disable*/

import React, {Component} from 'react';

export default class GMap extends Component {
  init(data) {
    new GMaps({
      scrollwheel: false,
      div: '#basic-map',
      lat: -12.043333,
      lng: -77.028333
    });
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  render() {
    return (
      <div id='basic-map' style={{height: 300}} />
    );
  }
}

/*eslint-disable*/
