import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get all cart items with populated product info
// @route   GET /api/cart
// @access  Public
export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find().populate('product');

    // Clean up any items whose product may have been deleted
    const validItems = cartItems.filter((item) => item.product !== null);

    // Calculate subtotal, tax (5%), and grand total
    const subtotal = validItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const totalItems = validItems.reduce((acc, item) => acc + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        items: validItems,
        totalItems,
        subtotal: Number(subtotal.toFixed(2)),
        tax,
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart items',
      error: error.message,
    });
  }
};

// @desc    Add item to cart or increment quantity
// @route   POST /api/cart
// @access  Public
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let cartItem = await Cart.findOne({ product: productId });

    if (cartItem) {
      cartItem.quantity += Number(quantity);
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        product: productId,
        quantity: Number(quantity),
      });
    }

    await cartItem.populate('product');

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
};

// @desc    Update quantity of an item in cart
// @route   PUT /api/cart/:productId
// @access  Public
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    let cartItem = await Cart.findOne({ product: productId });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    cartItem.quantity = Number(quantity);
    await cartItem.save();
    await cartItem.populate('product');

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cartItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:productId
// @access  Public
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cartItem = await Cart.findOneAndDelete({ product: productId });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message,
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Public
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({});
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
};
