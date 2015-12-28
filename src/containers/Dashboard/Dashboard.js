import React, { Component } from 'react';
import { MainChart, MaleFemaleChart } from 'components';

export default class Dashboard extends Component {
  getMainData() {
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

    return data;
  }

  getGenderData() {
    return {
      male: [
        {x: 2005, y: 21},
        {x: 2006, y: 44},
        {x: 2007, y: 14},
        {x: 2008, y: 18},
        {x: 2009, y: 23},
        {x: 2010, y: 21}
      ],
      female: [
        {x: 2005, y: -10},
        {x: 2006, y: -56},
        {x: 2007, y: -86},
        {x: 2008, y: -82},
        {x: 2009, y: -77},
        {x: 2010, y: -79}
      ]
    };
  }

  render() {
    const mainData = this.getMainData();

    const genderData = this.getGenderData();

    return (
      <div>
        <MainChart data={mainData}/>
        <MaleFemaleChart data={genderData}/>
      </div>
    );
  }
}
