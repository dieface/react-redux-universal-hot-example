const app = require('../../utils/db/client/client');
const Product = app.models.product;

function updateProduct(resolve, reject, product) {
  Product.upsert(product, (err, updated) => {
    if(err) {
      reject(err);
      return;
    }

    resolve(updated);
  });
}

export default function update(req) {
  return new Promise((resolve, reject) => {
    // write to database
    const product = req.body;
    updateProduct(resolve, reject, product);
  });
}
