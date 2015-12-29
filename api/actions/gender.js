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
      user: getMainData()
    });
  });
}
