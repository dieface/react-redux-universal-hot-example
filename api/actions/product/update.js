import load from './load';

export default function update(req) {
  return new Promise((resolve, reject) => {
    // write to database
    setTimeout(() => {
      const product = req.body;
      resolve(product);
    }, 1500); // simulate async db write
  });
}
