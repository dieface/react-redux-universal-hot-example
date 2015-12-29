/*eslint-disable*/

import React, {Component, PropTypes} from 'react';

export default class MaleFemaleChart extends Component {
  static propTypes = {
    data: PropTypes.object
  }

  state = {
    male: null,
    female: null
  }

  init(data) {
    // const Rubix = require('helpers/rubix/rubix');
    // const d3 = require('d3');

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

    var columnMale = chart.column_series({
      name: 'male',
      color: '#2D89EF',
      marker: 'cross'
    });

    var maleData = data["male"];
    columnMale.addData(maleData);

    var columnFemale = chart.column_series({
      name: 'female',
      color: '#FF0097',
      marker: 'diamond'
    });

    var femaleData = data["female"];
    columnFemale.addData(femaleData);

    this.colMale = columnMale;
    this.colFemale = columnFemale;
  }

  update(data) {
    //Remove old points and data
    //extracted from ColumnSeries.prototype.show() & ColumnSeries.prototype.addData()
    this.colMale.removeData();
    this.colFemale.removeData();
    //Add new data and points
    this.colMale.addData(data["male"]);
    this.colFemale.addData(data["female"]);

    // male.addData(data["male"]);

    //Clear and redraw rects
    // male.cb_series.selectAll('.column-layer').remove();
    // let p = male.cb_series.selectAll('.column-layer').data(male.layers, function(d, i) {
    //   if (d.key === self.name) {
    //     self.count = i;
    //   }
    //   return d.key;
    // });
    //
    // male.columnGroup = p.enter().append('g');
    // male.columnGroup.attr('class', 'column-layer')
    // .attr('fill', function(d) { return d.color; }).attr('fill-opacity', male.opts.fillopacity);
    //
    // male._createRect();
    //
    // p.exit().remove();
  }

  componentDidMount() {
    console.log("------ componentDidMount");

    const {data} = this.props;
    this.init(data);
  }

  componentDidUpdate() {
    console.log("------ componentDidUpdate");

    const {data} = this.props;
    this.update(data);
  }

  render() {
    return <div id='male-female-chart'></div>;
  }
}

/*eslint-disable*/
