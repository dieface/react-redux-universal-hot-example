/*eslint-disable*/

import React, {Component} from 'react';

export default class Pie extends Component {
  init(data) {
    var pie = Rubix.Pie('#pie-chart', {
      title: 'Pie chart',
      subtitle: 'Browser Share',
      height: 300
    });

    pie.addData(data);
    this.pie = pie;
  }

  update(data) {
    for (var i = 0; i < data.length; i++) {
      this.pie.updatePoint(data[i]);
    }
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  componentDidUpdate() {
    const {data} = this.props;
    this.update(data);
  }

  render() {
    return (
      <div id='pie-chart' />
    );
  }
}

/*eslint-disable*/
