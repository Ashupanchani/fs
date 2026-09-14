/**
 * Automated Test Script for all 15 E-Commerce CRUD Endpoints
 * Run with: node test-apis.js
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Automated API Tests (15 Endpoints)');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  let createdProductId = null;
  let sampleProductId = null;
  let createdOrderId = null;

  // 1. API Health / Index
  await test('1. GET /api - API Directory & Health', async () => {
    const res = await fetch(`${BASE_URL}/api`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.endpoints) throw new Error('Missing endpoints in directory response');
  });

  // 2. Public API Seeding
  await test('2. POST /api/products/seed - Seed Public Products', async () => {
    const res = await fetch(`${BASE_URL}/api/products/seed`, { method: 'POST' });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.count === 0) throw new Error('Seeding returned 0 products');
  });

  // 3. GET /api/products
  await test('3. GET /api/products - Retrieve all products', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.data.length === 0) throw new Error('No products returned');
    sampleProductId = data.data[0]._id;
  });

  // 4. GET /api/products/:id
  await test('4. GET /api/products/:id - Retrieve single product', async () => {
    const res = await fetch(`${BASE_URL}/api/products/${sampleProductId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data._id !== sampleProductId) throw new Error('Mismatched product ID');
  });

  // 5. POST /api/products - Create new product
  await test('5. POST /api/products - Create new custom product', async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'CIA Exam Special Smart Watch',
        price: 99.99,
        category: 'electronics',
        description: 'High performance testing device for CIA evaluation',
        stock: 50,
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    createdProductId = data.data._id;
  });

  // 6. PUT /api/products/:id - Update product
  await test('6. PUT /api/products/:id - Update product details', async () => {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: 79.99,
        stock: 45,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data.price !== 79.99) throw new Error('Price was not updated');
  });

  // 7. POST /api/cart - Add to cart
  await test('7. POST /api/cart - Add item to cart', async () => {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: createdProductId, quantity: 2 }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (data.data.quantity !== 2) throw new Error('Quantity mismatch');
  });

  // 8. GET /api/cart - Retrieve cart
  await test('8. GET /api/cart - Retrieve cart with totals', async () => {
    const res = await fetch(`${BASE_URL}/api/cart`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data.items.length === 0) throw new Error('Cart should not be empty');
    if (data.data.total <= 0) throw new Error('Cart total should be positive');
  });

  // 9. PUT /api/cart/:productId - Update cart quantity
  await test('9. PUT /api/cart/:productId - Update cart quantity', async () => {
    const res = await fetch(`${BASE_URL}/api/cart/${createdProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 3 }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data.quantity !== 3) throw new Error('Quantity did not update to 3');
  });

  // 10. DELETE /api/cart/:productId - Remove item from cart
  await test('10. DELETE /api/cart/:productId - Remove single item', async () => {
    const res = await fetch(`${BASE_URL}/api/cart/${createdProductId}`, {
      method: 'DELETE',
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 11. DELETE /api/cart - Clear cart
  await test('11. DELETE /api/cart - Clear entire cart', async () => {
    // Add sample product first
    await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: sampleProductId, quantity: 1 }),
    });
    // Clear
    const res = await fetch(`${BASE_URL}/api/cart`, { method: 'DELETE' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 12. POST /api/orders - Checkout order
  await test('12. POST /api/orders - Checkout & place order', async () => {
    // Put item in cart first
    await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: createdProductId, quantity: 1 }),
    });

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Student Evaluator',
        email: 'evaluator@college.edu',
        address: 'Department of Computer Science & Engineering',
        phone: '9988776655',
      }),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    createdOrderId = data.data._id;
  });

  // 13. GET /api/orders - Retrieve orders
  await test('13. GET /api/orders - Retrieve order history', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.data || data.data.length === 0) throw new Error('Order history is empty');
  });

  // 14. GET /api/orders/:id - Single order detail
  await test('14. GET /api/orders/:id - Retrieve single order details', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data._id !== createdOrderId) throw new Error('Mismatched order ID');
  });

  // 15. PATCH /api/orders/:id/status - Update order status
  await test('15. PATCH /api/orders/:id/status - Update order status', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Shipped' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.data.status !== 'Shipped') throw new Error('Status was not updated to Shipped');
  });

  // Clean-up: Delete test product
  await test('16. DELETE /api/products/:id - Delete product (CRUD D)', async () => {
    const res = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
      method: 'DELETE',
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
