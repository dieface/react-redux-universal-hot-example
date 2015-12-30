/*eslint-disable*/

import React, {Component} from 'react';

export default class Pie extends Component {
  init(data) {
    var donut = Rubix.Donut('#donut-chart', {
      title: 'Realtime Donut chart',
      subtitle: 'Browser Share',
      height: 300
    });

    donut.addData(data);
    this.donut = donut;
  }

  update(data) {
    console.info("[Donut] update with data: ", data);

    for (var i = 0; i < data.length; i++) {
      this.donut.updatePoint(data[i]);
    }
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  componentDidUpdate() {
    console.info("[Donut] didUpdate");

    const {data} = this.props;
    console.log(data);

    this.update(data);
  }

  render() {
    return (
      <div id='donut-chart' />
    );
  }
}

/*eslint-disable*/
