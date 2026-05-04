const express = require('express');
const router = express.Router();

//Import from Product Controller
const { getProducts, getProductById } = require('../controllers/productController');

//Import from Admin Controller (THIS is usually what causes the crash!)
const { createProduct } = require('../controllers/adminController');

//Import Middlewares
const { protect,admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// GET Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// POST Route (Admin bypass enabled for testing: only requires 'protect')
router.post('/', protect, admin, upload.array('images', 5), createProduct);

module.exports = router;