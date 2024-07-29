const express = require('express');
const router = express.Router();
const Product = require('../models/products');

// Get a specific product by its id
router.get('/:product', async (req, res) => {
  try {
    const product = await Product.findById(req.params.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reviews for a product, limited to 4 at a time
router.get('/:product/reviews', async (req, res) => {
  const { page = 1, limit = 4 } = req.query;
  try {
    const product = await Product.findById(req.params.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const reviews = product.reviews.slice((page - 1) * limit, page * limit);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  const { name, price, category, description, image } = req.body;
  const product = new Product({
    name,
    price,
    category,
    description,
    image,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create a new review for a product
router.post('/:product/reviews', async (req, res) => {
  const { userName, text } = req.body;
  try {
    const product = await Product.findById(req.params.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const review = { userName, text, product: req.params.product };
    product.reviews.push(review);
    await product.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product by id
router.delete('/:product', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a review by id
router.delete('/reviews/:review', async (req, res) => {
  try {
    const product = await Product.findOne({ 'reviews._id': req.params.review });
    if (!product) {
      return res.status(404).json({ message: 'Review not found' });
    }
    product.reviews.id(req.params.review).remove();
    await product.save();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products with pagination, category filter, sorting, and search
router.get('/', async (req, res) => {
  const { page = 1, limit = 9, category, sort, search } = req.query;

  const query = {};
  if (category) {
    query.category = category;
  }
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  try {
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : {})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
