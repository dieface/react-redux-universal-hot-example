const moment = require('moment');
const chance = require('chance').Chance();

function rnd() {
  return Math.round(Math.random() * 30) + 1;
}

function getMainData() {
  /*eslint-disable*/
  var t = 1297110663*850;
  var v = [5, 10, 2, 20, 40, 35, 30, 20, 25, 10, 20, 10, 20, 15, 25, 20, 30, 25, 30, 25, 30, 35, 40, 20, 15, 20, 10, 25, 15, 20, 10, 25, 30, 30, 25, 20, 10, 50, 60, 30];

  var getValue = function() {
    var val = v.shift();
    v.push(val);
    return val;
  }

  var d3 = require('d3');
  var data = d3.range(40).map(function() {
    return {
      x: (t+=(86400000*20)),
      y: rnd()//getValue()
    };
  });

  return data;
  /*eslint-disable*/
}

function getPieData() {
  var firefox = rnd();
  var ie = rnd();
  var chrome = 100 - firefox - ie;

  return [
    {
      name: 'Firefox',
      value: firefox,
      color: '#4572a7'
    },
    {
      name: 'IE',
      value: ie,
      color: '#aa4643'
    },
    {
      name: 'Chrome',
      value: chrome,
      color: '#89a54e'
    }
  ];
}

function getDonutData() {
  const browsers = [
    {
      name: 'Firefox',
      color: '#4572a7'
    },
    {
      name: 'IE',
      color: '#aa4643'
    },
    {
      name: 'Chrome',
      color: '#89a54e'
    },
    {
      name: 'Safari',
      color: '#80699b'
    },
    {
      name: 'Opera',
      color: '#3d96ae'
    },
    {
      name: 'Others',
      color: '#db843d'
    }
  ];

  const b = browsers[Math.floor(Math.random() * browsers.length)];

  const data = [{
    name: b.name,
    value: Math.random() * 100,
    color: b.color
  }];
  console.log("donut data: ", data);

  return data;
}

function getLineData() {
  const data = [
    {x: 1, y: rnd()},
    {x: 2, y: rnd()},
    {x: 3, y: rnd()},
    {x: 4, y: rnd()},
    {x: 5, y: rnd()},
    {x: 6, y: rnd()},
    {x: 7, y: rnd()},
    {x: 8, y: rnd()},
    {x: 9, y: rnd()},
    {x: 10, y: rnd()},
  ];

  const data2 = [
    {x: 1, y: rnd()},
    {x: 2, y: rnd()},
    {x: 3, y: rnd()},
    {x: 4, y: rnd()},
    {x: 5, y: rnd()},
    {x: 6, y: rnd()},
    {x: 7, y: rnd()},
    {x: 8, y: rnd()},
    {x: 9, y: rnd()},
    {x: 10, y: rnd()},
  ];

  const data3 = [
    {x: 1, y: rnd()},
    {x: 2, y: rnd()},
    {x: 3, y: rnd()},
    {x: 4, y: rnd()},
    {x: 5, y: rnd()},
    {x: 6, y: rnd()},
    {x: 7, y: rnd()},
    {x: 8, y: rnd()},
    {x: 9, y: rnd()},
    {x: 10, y: rnd()},
  ];

  return [data, data2, data3];
}

function getTimelineData() {
  const count = chance.integer({min: 1, max: 5});

  // console.log('timeline count: ', count);
  // console.log('timeline date: ', chance.date());

  const data = [];

  for (let i = 0; i < count; i++) {
    const item = {
      createdAt: moment(chance.date()).format('YYYY-MM-DD'),
      messages: (() => {
        const msgCount = chance.integer({min: 1, max: 3});
        const msgs = [];
        for (let j = 0; j < msgCount; j++) {
          msgs.push(chance.paragraph());
        }
        // console.log('timeline msgs: ', msgs);
        return msgs;
      })()
    };

    // console.log('timeline item: ', item);
    data.push(item);
    // console.log('timeline data: ', data);
  }

  // console.log('timeline data: ', data);
  return data;
}

function getTableData() {
  const count = chance.integer({min: 100, max: 200});

  const data = {},
  columns = [
    "Name",
    "Gender",
    "Office",
    "Age",
    "Start Date",
    "Salary"
  ],
  rows = [];

  for (let i = 0; i < count; i++) {
    const item = {
      name: chance.name(),
      gender: chance.gender(),
      office: chance.city(),
      age: chance.age(),
      startAt: moment(chance.date()).format('YYYY-MM-DD'),
      salary: chance.dollar()
    };

    rows.push(item);
  }

  data["columns"] = columns;
  data["rows"] = rows;

  return data;
}

export default function gender() {
  return new Promise((resolve) => {
    resolve({
      gender: {
        male: [
          {x: 2005, y: rnd()},
          {x: 2006, y: rnd()},
          {x: 2007, y: rnd()},
          {x: 2008, y: rnd()},
          {x: 2009, y: rnd()},
          {x: 2010, y: rnd()}
        ],
        female: [
          {x: 2005, y: rnd() * (-1)},
          {x: 2006, y: rnd() * (-1)},
          {x: 2007, y: rnd() * (-1)},
          {x: 2008, y: rnd() * (-1)},
          {x: 2009, y: rnd() * (-1)},
          {x: 2010, y: rnd() * (-1)}
        ]
      },
      user: getMainData(),
      pie: getPieData(),
      donut: getDonutData(),
      line: getLineData(),
      timeline: getTimelineData(),
      table: getTableData()
    });
  });
}
