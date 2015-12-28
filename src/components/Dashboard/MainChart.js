/*eslint-disable*/

import React, {Component, PropTypes} from 'react';
// import Rubix from 'helpers/rubix/rubix';

class MainChart extends Component {
  static propTypes = {
    info: PropTypes.object
  }

  componentDidMount() {
    // const Rubix = require('helpers/rubix/rubix');
    // const d3 = require('d3');
    const {info} = this.props;
    var chart = new Rubix('#main-chart', info);

    var total_users = chart.area_series({
      name: 'Total Users',
      color: '#2EB398',
      marker: 'circle',
      fillopacity: 0.7,
      noshadow: true
    });

    chart.extent = [1297110663*850+(86400000*20*(.35*40)), 1297110663*850+(86400000*20*(.66*40))];

    var t = 1297110663*850;
    var v = [5, 10, 2, 20, 40, 35, 30, 20, 25, 10, 20, 10, 20, 15, 25, 20, 30, 25, 30, 25, 30, 35, 40, 20, 15, 20, 10, 25, 15, 20, 10, 25, 30, 30, 25, 20, 10, 50, 60, 30];

    var getValue = function() {
      var val = v.shift();
      v.push(val);
      return val;
    }

    var data = d3.range(40).map(function() {
      return {
        x: (t+=(86400000*20)),
        y: getValue()
      };
    });

    total_users.addData(data);
  }
  render() {
    return (
      <div id='main-chart'></div>
    );
  }
}

export default class extends Component {
  static propTypes = {
    data: PropTypes.object
  }

  render() {
    const {data} = this.props;

    return (
      <MainChart info={data} />
    );
  }
}

/*eslint-disable*/
