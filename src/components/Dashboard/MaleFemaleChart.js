/*eslint-disable*/

import React, {Component, PropTypes} from 'react';

class MaleFemaleChart extends Component {
  static propTypes = {
    info: PropTypes.object
  }

  componentDidMount() {
    // const Rubix = require('helpers/rubix/rubix');
    // const d3 = require('d3');
    const {info} = this.props;

    var chart = new Rubix('#male-female-chart', info);

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
  static propTypes = {
    data: PropTypes.object
  }

  render() {
    const {data} = this.props;

    return (
      <MaleFemaleChart info={data} />
    );
  }
}

/*eslint-disable*/
