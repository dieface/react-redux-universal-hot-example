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

    var browsers = ['Firefox', 'IE', 'Chrome', 'Safari', 'Opera', 'Others'], name;

    var redrawDonut = () => {
      name = browsers.shift();
      browsers.push(name);
      return {
        name: name,
        value: Math.random() * 100
      };
    };

    this.interval = setInterval(() => {
      donut.updatePoint(redrawDonut());
    }, 1000);
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  render() {
    return (
      <div id='donut-chart' />
    );
  }
}

/*eslint-disable*/
