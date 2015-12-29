/*eslint-disable*/

import React, {Component} from 'react';

export default class Line extends Component {
  init(data) {
    var layout = {
      title: 'Line + Stacked Area (Cardinal Interpolation)',
      height: 300,
      tooltip: {
        color: 'white',
        format: {
          x: '.0f',
          y: '.0f'
        }
      },
      stacked: true,
      show_markers: false,
      interpolate: 'cardinal'
    };

    var chart = new Rubix('#line-stackedarea-chart', layout);

    var line = chart.line_series({
      name: 'Line Series',
      color: '#B4A1DD',
      show_markers: true
    });

    line.addData(data[0]);

    var area = chart.area_series({
      name: 'Area Series',
      color: '#aa4643'
    });

    area.addData(data[1]);

    var area2 = chart.area_series({
      name: 'Area Series 2',
      color: '#4572a7'
    });

    area2.addData(data[2]);
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  render() {
    return (
      <div id='line-stackedarea-chart' />
    );
  }
}

/*eslint-disable*/
