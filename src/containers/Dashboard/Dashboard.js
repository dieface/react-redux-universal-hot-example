import React, { Component } from 'react';

export default class Test extends Component {
  componentDidMount() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiYnJ1Y2VsZWUiLCJhIjoiQkZtY0dJMCJ9.a7zFI-MdJbKT9SGLSDFHeQ';
    var map = L.mapbox.map('map', 'brucelee.jbk1b284')
    .setView([38.909671288923, -77.034084142948], 13);
  }

  render() {
    return (
      <div>
        <div class='sidebar pad2'>Listing</div>
        <div id='map' class='map pad2'>Map</div>
      </div>
    );
  }
}
