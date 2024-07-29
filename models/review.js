const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  userName: { type: String, required: true },
  text: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
});

module.exports = mongoose.model('Review', reviewSchema);
