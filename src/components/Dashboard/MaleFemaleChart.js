/*eslint-disable*/

import React, {Component, PropTypes} from 'react';

export default class MaleFemaleChart extends Component {
  static propTypes = {
    data: PropTypes.object
  }

  componentDidMount() {
    // const Rubix = require('helpers/rubix/rubix');
    // const d3 = require('d3');
    const {data} = this.props;

    const layout = {
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
        y: {
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
    };

    var chart = new Rubix('#male-female-chart', layout);

    var column = chart.column_series({
      name: 'Male Visitors',
      color: '#2D89EF',
      marker: 'cross'
    });

    var maleData = data["male"];
    column.addData(maleData);

    var column1 = chart.column_series({
      name: 'Female Visitors',
      color: '#FF0097',
      marker: 'diamond'
    });

    var femaleData = data["female"];
    column1.addData(femaleData);
  }
  render() {
    return <div id='male-female-chart'></div>;
  }
}

/*eslint-disable*/
