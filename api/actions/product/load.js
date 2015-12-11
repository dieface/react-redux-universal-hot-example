const initialProducts= [
  {id: 1, color: 'Red', sprocketCount: 7, owner: 'John'},
  {id: 2, color: 'Taupe', sprocketCount: 1, owner: 'George'},
  {id: 3, color: 'Green', sprocketCount: 8, owner: 'Ringo'},
  {id: 4, color: 'Blue', sprocketCount: 2, owner: 'Paul'}
];

export function getProducts(req) {
  let products = req.session.products;
  if (!products) {
    products = initialProducts;
    req.session.products = products;
  }
  return products;
}

var app = require('../../utils/db/client/client');

export default function load(req) {
  return new Promise((resolve, reject) => {
    // make async call to database
    setTimeout(() => {
      // call a method on the server
      console.log("============ 1 ==============");
      app.models.category.find(function(err, people) {
        console.log("Created Category...");
        console.log(err || people);
      });

      resolve(getProducts(req));
    }, 1000); // simulate async load
  });
}
