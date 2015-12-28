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

    var column = chart.column_series({
      name: 'male',
      color: '#2D89EF',
      marker: 'cross'
    });

    var maleData = data["male"];
    column.addData(maleData);

    var column1 = chart.column_series({
      name: 'female',
      color: '#FF0097',
      marker: 'diamond'
    });

    var femaleData = data["female"];
    // column1.addData(femaleData);

    this.setState({
      male: column,
      female: column1
    });
  }

  update(data) {
    let { male, female } = this.state;

    // male.data = data["male"];

    //Remove old points and data
    //extracted from ColumnSeries.prototype.show() & ColumnSeries.prototype.addData()
    male.removeData();
    male.addData(data["male"]);
    // while(male.column_stack.length>0) {
    //   let rawData = male.column_stack.shift();
    //   male.removePoint(rawData.ref);
    // }
    // if (male.column_stack.length) {
    //   let rawData = male.column_stack.shift();
      // if (rawData.type === 'addPoint') {
      //   male.addPoint(rawData.data, rawData.shift, true);
      // } else {
        // male.removePoint(rawData.ref);
      // }
    // }

    //Add new data and points
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

    // male.rubix.resetFocus();


    // male.update([]);
    // female.update([]);

    // male.update(data["male"]);
    // male.rubix.resetFocus();
    // male.draw(true);
    // male.setupFocus();

    // male.rubix.resetFocus(true);
    // male.rubix.resetFocus();
    // male.rubix.resetAxis();
    // male.rubix.forceRedraw();
    // male._animate_draw();

    // female.update(data["female"]);
    //
    // male.rubix.resetAxis();
    // male.rubix.forceRedraw();
    //
    // female.rubix.resetAxis();
    // female.rubix.forceRedraw();
    // this.rubix.resetAxis();
    // this.rubix.forceRedraw();
    // this._animate_draw();

    // male.redraw();
    // female.redraw()

    // male._animate_draw();
    // female._animate_draw()

    // male.forceRedraw();
    // female.forceRedraw()

    // male.addData(data["male"]);
    // female.addData(data["female"]);
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
