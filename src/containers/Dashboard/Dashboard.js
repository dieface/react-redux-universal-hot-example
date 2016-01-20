import React, { Component, PropTypes } from 'react';
import { BootstrapTable, MainChart, MaleFemaleChart, Pie, Donut, Line, DataTable, GMap, Timeline } from 'components';

import {connect} from 'react-redux';
import {isLoaded, load as loadCharts} from 'redux/modules/dashboard';
import * as chartActions from 'redux/modules/dashboard';
import connectData from 'helpers/connectData';

/* Table */
const Griddle = require('griddle-react');
import { Table, Cell, Column } from 'fixed-data-table';

// Table data as a list of array.
const rows = [
  ['a1', 'b1', 'c1'],
  ['a2', 'b2', 'c2'],
  ['a3', 'b3', 'c3'],
  // .... and more
];


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
    const {data} = this.props;
    return data.pie;
  }

  getDonutData() {
    const {data} = this.props;
    return data.donut;
  }

  getLineData() {
    const {data} = this.props;
    return data.line;
  }

  getTimelineData() {
    const {data} = this.props;
    return data.timeline;
  }

  getTableData() {
    const {data} = this.props;
    return data.table;
  }

  getGriddleData() {
    const {data} = this.props;
    return data.griddle;
  }

  render() {
    const mainData = this.getMainData();
    const genderData = this.getGenderData();
    const pieData = this.getPieData();
    const donutData = this.getDonutData();
    const lineData = this.getLineData();
    const timelineData = this.getTimelineData();
    const tableData = this.getTableData();
    const fakeData = this.getGriddleData();
    // const fakeData = [
    //   {
    //     "id": 0,
    //     "name": "Mayer Leonard",
    //     "city": "Kapowsin",
    //     "state": "Hawaii",
    //     "country": "United Kingdom",
    //     "company": "Ovolo",
    //     "favoriteNumber": 7
    //   },
    //   {
    //     "id": 1,
    //     "name": "Koch Becker",
    //     "city": "Johnsonburg",
    //     "state": "New Jersey",
    //     "country": "Madagascar",
    //     "company": "Eventage",
    //     "favoriteNumber": 2
    //   }
    // ];
    //
    // const exampleMetadata = [
    //   {
    //     "columnName": "name",
    //     "order": 9,
    //     "locked": false,
    //     "visible": true,
    //     "displayName": "Employee Name"
    //   },
    //   {
    //     "columnName": "city",
    //     "order": 8,
    //     "locked": false,
    //     "visible": true
    //   },
    //   {
    //     "columnName": "state",
    //     "order": 7,
    //     "locked": false,
    //     "visible": true
    //   },
    //   {
    //     "columnName": "country",
    //     "order": 6,
    //     "locked": false,
    //     "visible": true
    //   },
    //   {
    //     "columnName": "company",
    //     "order": 5,
    //     "locked": false,
    //     "visible": true
    //   },
    //   {
    //     "columnName": "favoriteNumber",
    //     "order":  4,
    //     "locked": false,
    //     "visible": true,
    //     "displayName": "Favorite Number"
    //   }
    // ];
    
    return (
      <div>
        <BootstrapTable />
        {/* <Griddle results={fakeData} columnMetadata={exampleMetadata} showFilter={true}
              showSettings={true} columns={["city", "state", "country"]}/> */}
        {/* <DataTable data={tableData}/> */}
        <GMap/>
        <Timeline data={timelineData}/>
        <MainChart data={mainData}/>
        <MaleFemaleChart data={genderData}/>
        <Pie data={pieData}/>
        <Donut data={donutData}/>
        <Line data={lineData}/>
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
