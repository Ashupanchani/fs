import Product from '../models/Product.js';


// @desc    Get all products (with optional search and category filter)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 }; //newest product first
    if (sort === 'price-asc') sortOption = { price: 1 }; //price ascending
    if (sort === 'price-desc') sortOption = { price: -1 }; //price descending
    if (sort === 'name-asc') sortOption = { title: 1 }; //name ascending

    const products = await Product.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Failed to fetch products',
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Invalid product ID or server error',
      error: error.message,
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Public / Admin
export const createProduct = async (req, res) => {
  try {
    const { title, price, description, category, image, stock } = req.body;

    if (!title || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and price',
      });
    }

    const product = await Product.create({
      title,
      price: Number(price),
      description: description || '',
      category: category ? category.toLowerCase() : 'general',
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      stock: stock ? Number(stock) : 20,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

// @desc    Update product by ID
// @route   PUT /api/products/:id
// @access  Public / Admin
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id ${req.params.id}`,
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // ask mongoose to return the newly updated document
      runValidators: true, // runs schema validation rules on update
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

// @desc    Delete product by ID
// @route   DELETE /api/products/:id
// @access  Public / Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id ${req.params.id}`,
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

// @desc    Seed products from Public Free API (FakeStore API)
// @route   POST /api/products/seed
// @access  Public
export const seedProducts = async (req, res) => {
  try {
    const response = await fetch('https://fakestoreapi.com/products?limit=12');
    if (!response.ok) {
      throw new Error(`Public API returned status: ${response.status}`);
    }

    const rawProducts = await response.json();
    if (!rawProducts || rawProducts.length === 0) {
      throw new Error('No products returned from external Public API');
    }

    // Format products for MongoDB model
    const formatted = rawProducts.map((p) => ({
      title: p.title,
      price: Number(p.price),
      description: p.description,
      category: p.category ? p.category.toLowerCase() : 'general',
      image: p.image,
      rating: p.rating || { rate: 4.5, count: 20 },
      stock: 25,
    }));

    // Clear existing products and insert new ones
    await Product.deleteMany({});
    const inserted = await Product.insertMany(formatted);

    const result = {
      success: true,
      message: `Successfully seeded ${inserted.length} products from Free Public API into MongoDB!`,
      count: inserted.length,
      data: inserted,
    };

    if (res) {
      return res.status(201).json(result);
    }
    return result;
  } catch (error) {
    console.error('Seed error:', error);
    if (res) {
      return res.status(500).json({
        success: false,
        message: 'Failed to seed products',
        error: error.message,
      });
    }
    throw error;
  }
};
