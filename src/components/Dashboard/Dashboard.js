/*eslint-disable*/

import React, {Component} from 'react';
import Rubix from 'helpers/rubix/rubix';
const d3 = require('d3');

class MainChart extends Component {
  componentDidMount() {
    const chart = new Rubix('#main-chart', {
      width: '100%',
      height: 300,
      title: 'Chart of Total Users',
      titleColor: '#2EB398',
      subtitle: 'Period: 2004 and 2008',
      subtitleColor: '#2EB398',
      axis: {
        x: {
          type: 'datetime',
          tickCount: 3,
          label: 'Time',
          labelColor: '#2EB398'
        },
        y: {
          type: 'linear',
          tickFormat: 'd',
          tickCount: 2,
          labelColor: '#2EB398'
        }
      },
      tooltip: {
        color: '#55C9A6',
        format: {
          y: '.0f',
          x: '%x'
        }
      },
      margin: {
        top: 25,
        left: 50,
        right: 25
      },
      interpolate: 'linear',
      master_detail: true
    });

    const totalUsers = chart.area_series({
      name: 'Total Users',
      color: '#2EB398',
      marker: 'circle',
      fillopacity: 0.7,
      noshadow: true
    });

    chart.extent = [1297110663 * 850 + (86400000 * 20 * (0.35 * 40)), 1297110663 * 850 + (86400000 * 20 * (0.66 * 40))];

    let tt = 1297110663 * 850;
    let vv = [5, 10, 2, 20, 40, 35, 30, 20, 25, 10, 20, 10, 20, 15, 25, 20, 30, 25, 30, 25, 30, 35, 40, 20, 15, 20, 10, 25, 15, 20, 10, 25, 30, 30, 25, 20, 10, 50, 60, 30];

    const getValue = () => {
      const val = vv.shift();
      vv.push(val);
      return val;
    };

    const data = d3.range(40).map(() => {
      return {
        x: (tt += (86400000 * 20)),
        y: getValue()
      };
    });

    totalUsers.addData(data);
  }
  render() {
    return (
      <div id="main-chart"></div>
    );
  }
}

export default class extends Component {
  render() {
    return (
      <MainChart />
    );
  }
}

/*eslint-disable*/
