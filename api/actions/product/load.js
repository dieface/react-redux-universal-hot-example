const app = require('../../utils/db/client/client');
const Product = app.models.product;
const perPage = 10;

function getProducts(resolve, reject, page) {
  const skip = perPage * (page - 1);
  Product.find({skip: skip, limit: perPage}, (err, products) => {
    if(err) {
      reject(err);
      return;
    }

    Product.count((err, total) => {
      let obj = {};

      products.forEach((p, index) => {
        obj[p.id] = p
      });

      resolve({products: obj, count: total, page: page});
    });
  });
}

export default function load(req) {
  return new Promise((resolve, reject) => {
    const page = req.query && req.query.page;
    console.log('======== page: ' + page);

    // make async call to database
    if(!page) {
      getProducts(resolve, reject, 1);
    } else {
      getProducts(resolve, reject, page);
    }
  });
}
