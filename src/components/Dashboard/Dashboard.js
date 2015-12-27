/*eslint-disable*/

import React, {Component} from 'react';
// import Rubix from 'helpers/rubix/rubix';

class MainChart extends React.Component {
  componentDidMount() {
    // const Rubix = require('helpers/rubix/rubix');
    // const d3 = require('d3');

    var chart = new Rubix('#main-chart', {
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

class MaleFemaleChart extends React.Component {
  componentDidMount() {
    // const Rubix = require('helpers/rubix/rubix');
    // const d3 = require('d3');

    var chart = new Rubix('#male-female-chart', {
      height: 200,
      title: 'Demographics',
      subtitle: 'Visitors',
      axis: {
        x: {
          type: 'ordinal',
          tickFormat: 'd',
          tickCount: 2,
          label: 'Time'
        },
        y:  {
          type: 'linear',
          tickFormat: 'd'
        }
      },
      tooltip: {
        theme_style: 'dark',
        format: {
          y: '.0f'
        },
        abs: {
          y: true
        }
      },
      stacked: true,
      interpolate: 'linear',
      show_markers: true
    });

    var column = chart.column_series({
      name: 'Male Visitors',
      color: '#2D89EF',
      marker: 'cross'
    });

    var data = [
      {x: 2005, y: 21},
      {x: 2006, y: 44},
      {x: 2007, y: 14},
      {x: 2008, y: 18},
      {x: 2009, y: 23},
      {x: 2010, y: 21}
    ];
    column.addData(data);

    var column1 = chart.column_series({
      name: 'Female Visitors',
      color: '#FF0097',
      marker: 'diamond'
    });

    var data1 = [
      {x: 2005, y: -79},
      {x: 2006, y: -56},
      {x: 2007, y: -86},
      {x: 2008, y: -82},
      {x: 2009, y: -77},
      {x: 2010, y: -79}
    ];
    column1.addData(data1);
  }
  render() {
    return <div id='male-female-chart'></div>;
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
