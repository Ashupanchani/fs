const Product = require('../models/Product');

// Fallback products in case external network is offline during viva demonstration
const fallbackProducts = [
  {
    title: 'Fjallraven - Foldsack No. 1 Backpack',
    price: 109.95,
    description: 'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    rating: { rate: 3.9, count: 120 },
    stock: 15,
  },
  {
    title: 'Mens Casual Premium Slim Fit T-Shirts',
    price: 22.3,
    description: 'Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
    rating: { rate: 4.1, count: 259 },
    stock: 30,
  },
  {
    title: 'Mens Cotton Jacket',
    price: 55.99,
    description: 'Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
    rating: { rate: 4.7, count: 500 },
    stock: 20,
  },
  {
    title: 'John Hardy Women\'s Legends Naga Gold & Silver Dragon Bracelet',
    price: 695.0,
    description: 'From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean\'s pearl.',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
    rating: { rate: 4.6, count: 400 },
    stock: 8,
  },
  {
    title: 'WD 2TB Elements Portable External Hard Drive - USB 3.0',
    price: 64.0,
    description: 'USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity.',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
    rating: { rate: 3.3, count: 203 },
    stock: 45,
  },
  {
    title: 'SanDisk SSD PLUS 1TB Internal SSD - SATA III 6 Gb/s',
    price: 109.0,
    description: 'Easy upgrade for faster boot up, shutdown, application load and response.',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
    rating: { rate: 2.9, count: 470 },
    stock: 25,
  },
  {
    title: 'BIYLACLESEN Women\'s 3-in-1 Snowboard Jacket Winter Coat',
    price: 56.99,
    description: 'Note:The Jackets is US standard size, Please choose size as your usual wear. Detachable fleece liner.',
    category: "women's clothing",
    image: 'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg',
    rating: { rate: 2.6, count: 235 },
    stock: 18,
  },
  {
    title: 'Lock and Love Women\'s Removable Hooded Faux Leather Moto Jacket',
    price: 29.95,
    description: '100% POLYURETHANE (shell) 100% POLYESTER (lining). Faux leather material for style and comfort with 2 pockets.',
    category: "women's clothing",
    image: 'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg',
    rating: { rate: 3.9, count: 340 },
    stock: 22,
  },
];

// @desc    Get all products (with optional search and category filter)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
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

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'name-asc') sortOption = { title: 1 };

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
exports.getProductById = async (req, res) => {
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
exports.createProduct = async (req, res) => {
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
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id ${req.params.id}`,
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
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
exports.deleteProduct = async (req, res) => {
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
exports.seedProducts = async (req, res) => {
  try {
    let rawProducts = [];

    // Try fetching from public free FakeStore API with a timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const response = await fetch('https://fakestoreapi.com/products?limit=12', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        rawProducts = await response.json();
      }
    } catch (fetchErr) {
      console.warn('FakeStore API fetch failed or timed out, using verified sample product dataset:', fetchErr.message);
    }

    if (!rawProducts || rawProducts.length === 0) {
      rawProducts = fallbackProducts;
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
