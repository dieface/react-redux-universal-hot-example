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
  }

  componentDidMount() {
    const {data} = this.props;
    this.init(data);
  }

  render() {
    return (
      <div id='pie-chart' />
    );
  }
}

/*eslint-disable*/
