import React, { Component, PropTypes } from 'react';
import { MainChart, MaleFemaleChart, Pie, Donut } from 'components';

import {connect} from 'react-redux';
import {isLoaded, load as loadCharts} from 'redux/modules/dashboard';
import * as chartActions from 'redux/modules/dashboard';
import connectData from 'helpers/connectData';

function fetchDataDeferred(getState, dispatch) {
  if (!isLoaded(getState())) {
    return dispatch(loadCharts());
  }
}

@connectData(null, fetchDataDeferred)
@connect(
  state => ({
    data: state.dashboard.data
  }),
  chartActions)
export default class Dashboard extends Component {
  static propTypes = {
    data: PropTypes.object,
    load: PropTypes.func.isRequired
  }

  componentDidMount() {
    console.log('~~~ componentDidMount');
    if (socket && !this.onMsgListener) {
      console.log('~~~ !this.onMsgListener start');
      this.onMsgListener = socket.on('msg', this.onMessageReceived);
      console.log('~~~ !this.onMsgListener end');
    }
  }

  componentWillUnmount() {
    console.log('~~~ componentWillUnmount');
    if (socket && this.onMsgListener) {
      console.log('~~~ this.onMsgListener start');
      socket.removeListener('on', this.onMsgListener);
      this.onMsgListener = null;
      console.log('~~~ this.onMsgListener end');
    }
  }

  onMessageReceived = () => {
    console.log('~~~ onMessageReceived');
    const { load } = this.props;
    load();
  }

  getMainData() {
    // var t = 1297110663*850;
    // var v = [5, 10, 2, 20, 40, 35, 30, 20, 25, 10, 20, 10, 20, 15, 25, 20, 30, 25, 30, 25, 30, 35, 40, 20, 15, 20, 10, 25, 15, 20, 10, 25, 30, 30, 25, 20, 10, 50, 60, 30];
    //
    // var getValue = function() {
    //   var val = v.shift();
    //   v.push(val);
    //   return val;
    // }
    //
    // var data = d3.range(40).map(function() {
    //   return {
    //     x: (t+=(86400000*20)),
    //     y: getValue()
    //   };
    // });
    //
    // return data;
    const {data} = this.props;
    // console.info('user: ', data.user);
    return data.user;
  }

  getGenderData() {
    const {data} = this.props;
    // console.info('gender: ', data.gender);
    return data.gender;
  }

  getPieData() {
    return [
      {
        name: 'Firefox',
        value: 45.0,
        color: '#4572a7'
      },
      {
        name: 'IE',
        value: 26.8,
        color: '#aa4643'
      },
      {
        name: 'Chrome',
        value: 12.8,
        color: '#89a54e'
      },
      {
        name: 'Safari',
        value: 8.5,
        color: '#80699b'
      },
      {
        name: 'Opera',
        value: 6.2,
        color: '#3d96ae'
      },
      {
        name: 'Others',
        value: 0.7,
        color: '#db843d'
      }
    ];
  }

  getDonutData() {
    return [
      {
        name: 'Firefox',
        value: 45.0,
        color: '#4572a7'
      },
      {
        name: 'IE',
        value: 26.8,
        color: '#aa4643'
      },
      {
        name: 'Chrome',
        value: 12.8,
        color: '#89a54e'
      },
      {
        name: 'Safari',
        value: 8.5,
        color: '#80699b'
      },
      {
        name: 'Opera',
        value: 6.2,
        color: '#3d96ae'
      },
      {
        name: 'Others',
        value: 0.7,
        color: '#db843d'
      }
    ];
  }

  render() {
    const mainData = this.getMainData();
    const genderData = this.getGenderData();
    const pieData = this.getPieData();
    const donutData = this.getDonutData();

    return (
      <div>
        <MainChart data={mainData}/>
        <MaleFemaleChart data={genderData}/>
        <Pie data={pieData}/>
        <Donut data={donutData}/>
        <button onClick={() => {
          socket.emit('msg', {
            from: 'fakeFrom',
            text: 'fakeText'
          });
        }}>
          Reload Charts
        </button>
      </div>
    );
  }
}
