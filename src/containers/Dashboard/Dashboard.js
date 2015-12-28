import React, { Component } from 'react';
import { MainChart, MaleFemaleChart } from 'components';

export default class Dashboard extends Component {
  render() {
    const mainData = {
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
    };

    const genderData = {
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

    return (
      <div>
        <MainChart data={mainData}/>
        <MaleFemaleChart data={genderData}/>
      </div>
    );
  }
}
