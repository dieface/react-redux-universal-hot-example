/*eslint-disable*/

import React, {Component} from 'react';
import { Input, Button } from 'react-bootstrap';

export default class GMap extends Component {
  constructor(props) {
    super(props);
    this.geocode = null;
  }

  geoCode(address) {
    GMaps.geocode({
      address: address,
      callback: (results, status) => {
        if (status == 'OK') {
          var latlng = results[0].geometry.location;
          this.geocode.setCenter(latlng.lat(), latlng.lng());
          this.geocode.addMarker({
            lat: latlng.lat(),
            lng: latlng.lng(),
            infoWindow: {
              content: '<div><strong>Address:</strong> '+results[0].formatted_address+'</div>'
            }
          });
        }
      }
    });
  }

  init(data) {
    var map = new GMaps({
      scrollwheel: false,
      div: '#basic-map',
      zoom: 16,
      lat: -12.043333,
      lng: -77.028333
    });

    // map.addMarker({
    //   lat: -12.043333,
    //   lng: -77.028333,
    //   title: 'Lima',
    //   click: (e) => {
    //     alert('You clicked in this marker');
    //   }
    // });
    //
    // map.addMarker({
    //   lat: -12.043333,
    //   lng: -77.029333,
    //   title: 'Lima',
    //   infoWindow: {
    //     content: '<p>Some content here!</p>'
    //   }
    // });
    //
    // map.drawOverlay({
    //   lat: -12.043333,
    //   lng: -77.029333,
    //   content: '<div class="overlay">Apple Store, NY, USA<div class="overlay_arrow above"></div></div>'
    // });

    this.geocode = map;
    this.geoCode('New York, NY, USA');
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  handleSubmit(e) {
    console.log('OK!');
    e.preventDefault();
    e.stopPropagation();
    this.geoCode($('#address').val());
  }

  render() {
    return (
      <div>
        <form onSubmit={::this.handleSubmit}>
          <Input type='text' id='address' placeholder='Address' defaultValue='New York, NY, USA' />
          <Button outlined onlyOnHover type='submit' bsStyle='darkgreen45'>search</Button>
        </form>
        <div id='basic-map' style={{height: 300}} />
      </div>
    );
  }
}

/*eslint-disable*/
