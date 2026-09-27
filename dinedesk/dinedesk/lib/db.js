import { Pool } from 'pg';

const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
      user: process.env.PGUSER || process.env.DB_USER || 'postgres',
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'lokesh2006',
      database: process.env.PGDATABASE || process.env.DB_NAME || 'dinedesk_db',
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 4000,
    };

let pool;
try {
  pool = new Pool(connectionConfig);
} catch (err) {
  console.error('[DB] Failed to instantiate pg Pool:', err.message);
}

// In-memory fallback store in case PostgreSQL is temporarily unreachable or offline
let memoryFallback = {
  menu_items: [
    { id: 1, name: 'Crispy Chicken Burger', category: 'Fast Food', price: 199.00, status: 'Available', sold_out: false, image: '🍔' },
    { id: 2, name: 'Cheesy Margherita Pizza', category: 'Italian', price: 349.00, status: 'Available', sold_out: false, image: '🍕' },
    { id: 3, name: 'Creamy Alfredo Pasta', category: 'Italian', price: 289.00, status: 'Available', sold_out: false, image: '🍝' },
    { id: 4, name: 'Paneer Tikka Platter', category: 'Starters', price: 249.00, status: 'Available', sold_out: false, image: '🍢' },
    { id: 5, name: 'Fresh Cold Coffee', category: 'Beverages', price: 120.00, status: 'Out of Stock', sold_out: true, image: '🧋' },
    { id: 6, name: 'Chocolate Lava Cake', category: 'Dessert', price: 159.00, status: 'Available', sold_out: false, image: '🍰' },
    { id: 7, name: 'Signature Veg Biryani', category: 'Main Course', price: 279.00, status: 'Available', sold_out: false, image: '🍚' },
    { id: 8, name: 'Classic Mint Mojito', category: 'Beverages', price: 139.00, status: 'Available', sold_out: false, image: '🍹' },
  ],
  orders: [
    {
      id: 101,
      order_id: 'ORD-101',
      customer_name: 'Alex Johnson',
      items: [
        { id: 1, name: 'Crispy Chicken Burger', price: 199, qty: 2 },
        { id: 8, name: 'Classic Mint Mojito', price: 139, qty: 1 }
      ],
      total_amount: 537.00,
      status: 'Preparing',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 102,
      order_id: 'ORD-102',
      customer_name: 'Priya Sharma',
      items: [
        { id: 2, name: 'Cheesy Margherita Pizza', price: 349, qty: 1 },
        { id: 5, name: 'Fresh Cold Coffee', price: 120, qty: 2 }
      ],
      total_amount: 589.00,
      status: 'Received',
      created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    },
    {
      id: 103,
      order_id: 'ORD-103',
      customer_name: 'David Lee',
      items: [
        { id: 3, name: 'Creamy Alfredo Pasta', price: 289, qty: 1 },
        { id: 6, name: 'Chocolate Lava Cake', price: 159, qty: 1 }
      ],
      total_amount: 448.00,
      status: 'Done',
      created_at: new Date(Date.now() - 55 * 60000).toISOString(),
    }
  ],
  reservations: [
    {
      id: 1,
      name: 'Rahul Kumar',
      email: 'rahul@example.com',
      phone: '9876543210',
      guests: 4,
      date: '2026-09-25',
      time: '19:30:00',
      status: 'Confirmed',
      created_at: new Date().toISOString()
    }
  ]
};

let isInitialized = false;
let dbAvailable = true;

export async function initDB() {
  if (isInitialized) return true;
  if (!pool) {
    dbAvailable = false;
    return false;
  }

  let client;
  try {
    client = await pool.connect();
    
    // 1. menu_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        sold_out BOOLEAN DEFAULT false,
        image VARCHAR(255) DEFAULT '🍽️'
      );
    `);

    // Ensure status & sold_out columns exist on menu_items
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='status') THEN
          ALTER TABLE menu_items ADD COLUMN status VARCHAR(50) DEFAULT 'Available';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='sold_out') THEN
          ALTER TABLE menu_items ADD COLUMN sold_out BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `);

    // Sync any existing sold_out rows with status
    await client.query(`
      UPDATE menu_items SET status = 'Out of Stock' WHERE sold_out = true AND (status IS NULL OR status = 'Available');
      UPDATE menu_items SET status = 'Available' WHERE status IS NULL;
    `);

    // 2. orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE,
        customer_name VARCHAR(255) DEFAULT 'Guest',
        items JSONB NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Received',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure order_id column exists on orders
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_id') THEN
          ALTER TABLE orders ADD COLUMN order_id VARCHAR(50);
        END IF;
      END $$;
    `);

    // Fill order_id for any legacy rows
    await client.query(`
      UPDATE orders SET order_id = 'ORD-' || id WHERE order_id IS NULL;
    `);

    // 3. reservations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        guests INT NOT NULL DEFAULT 2,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed default items if empty
    const countRes = await client.query('SELECT COUNT(*) FROM menu_items');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO menu_items (name, category, price, status, sold_out, image) VALUES
        ('Crispy Chicken Burger', 'Fast Food', 199.00, 'Available', false, '🍔'),
        ('Cheesy Margherita Pizza', 'Italian', 349.00, 'Available', false, '🍕'),
        ('Creamy Alfredo Pasta', 'Italian', 289.00, 'Available', false, '🍝'),
        ('Paneer Tikka Platter', 'Starters', 249.00, 'Available', false, '🍢'),
        ('Fresh Cold Coffee', 'Beverages', 120.00, 'Out of Stock', true, '🧋'),
        ('Chocolate Lava Cake', 'Dessert', 159.00, 'Available', false, '🍰'),
        ('Signature Veg Biryani', 'Main Course', 279.00, 'Available', false, '🍚'),
        ('Classic Mint Mojito', 'Beverages', 139.00, 'Available', false, '🍹');
      `);
    }

    // Seed default orders if empty
    const ordersCountRes = await client.query('SELECT COUNT(*) FROM orders');
    if (parseInt(ordersCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO orders (id, order_id, customer_name, items, total_amount, status) VALUES
        (101, 'ORD-101', 'Alex Johnson', '[{"id": 1, "name": "Crispy Chicken Burger", "price": 199, "qty": 2}, {"id": 8, "name": "Classic Mint Mojito", "price": 139, "qty": 1}]'::jsonb, 537.00, 'Preparing'),
        (102, 'ORD-102', 'Priya Sharma', '[{"id": 2, "name": "Cheesy Margherita Pizza", "price": 349, "qty": 1}, {"id": 5, "name": "Fresh Cold Coffee", "price": 120, "qty": 2}]'::jsonb, 589.00, 'Received'),
        (103, 'ORD-103', 'David Lee', '[{"id": 3, "name": "Creamy Alfredo Pasta", "price": 289, "qty": 1}, {"id": 6, "name": "Chocolate Lava Cake", "price": 159, "qty": 1}]'::jsonb, 448.00, 'Done');
      `);
      try {
        await client.query("SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));");
      } catch {
        // ignore sequence setval if not yet created
      }
    }

    isInitialized = true;
    dbAvailable = true;
    console.log('[DB] PostgreSQL initialized successfully with all tables and columns.');
    return true;
  } catch (error) {
    dbAvailable = false;
    console.warn('[DB] PostgreSQL connection/init notice:', error.message);
    console.warn('[DB] Falling back to robust in-memory data store until PostgreSQL is reachable.');
    return false;
  } finally {
    if (client) client.release();
  }
}

// Universal query runner: attempts PostgreSQL first; if DB offline, runs transparently against memory fallback
export async function query(text, params = []) {
  if (!isInitialized) {
    await initDB();
  }

  if (dbAvailable && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn('[DB] Query failed against PostgreSQL pool:', err.message);
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message.includes('connect')) {
        dbAvailable = false;
      } else {
        throw err;
      }
    }
  }

  // Robust In-Memory Emulation for smooth dev/demo experience
  const sql = text.trim();
  const upper = sql.toUpperCase();

  // --- MENU ITEMS ---
  if (upper.startsWith('SELECT * FROM MENU_ITEMS')) {
    return { rows: [...memoryFallback.menu_items].sort((a, b) => a.id - b.id) };
  }

  if (upper.includes('INSERT INTO MENU_ITEMS')) {
    const isOutOfStock = params[3] === 'Out of Stock' || params[4] === true;
    const newItem = {
      id: (memoryFallback.menu_items.length ? Math.max(...memoryFallback.menu_items.map(m => m.id)) : 0) + 1,
      name: params[0],
      category: params[1],
      price: parseFloat(params[2]),
      status: isOutOfStock ? 'Out of Stock' : 'Available',
      sold_out: isOutOfStock,
      image: params[4] || params[3] || '🍽️'
    };
    memoryFallback.menu_items.push(newItem);
    return { rows: [newItem] };
  }

  if (upper.includes('UPDATE MENU_ITEMS SET')) {
    // Check if updating by ID
    const id = parseInt(params[params.length - 1], 10);
    const item = memoryFallback.menu_items.find(m => m.id === id);
    if (item) {
      if (upper.includes('STATUS = $1')) {
        item.status = params[0];
        item.sold_out = params[0] === 'Out of Stock';
      }
      if (upper.includes('SOLD_OUT = $1')) {
        item.sold_out = Boolean(params[0]);
        item.status = params[0] ? 'Out of Stock' : 'Available';
      }
      return { rows: [item] };
    }
    return { rows: [] };
  }

  if (upper.includes('DELETE FROM MENU_ITEMS WHERE ID')) {
    const id = parseInt(params[0], 10);
    const deleted = memoryFallback.menu_items.find(m => m.id === id);
    memoryFallback.menu_items = memoryFallback.menu_items.filter(m => m.id !== id);
    return { rows: deleted ? [deleted] : [] };
  }

  // --- ORDERS ---
  if (upper.startsWith('SELECT * FROM ORDERS')) {
    return { rows: [...memoryFallback.orders].sort((a, b) => b.id - a.id) };
  }

  if (upper.includes('INSERT INTO ORDERS')) {
    const nextNumericId = (memoryFallback.orders.length ? Math.max(...memoryFallback.orders.map(o => o.id)) : 100) + 1;
    const givenOrderId = params[0]?.startsWith('ORD-') ? params[0] : `ORD-${nextNumericId}`;
    const newOrder = {
      id: nextNumericId,
      order_id: givenOrderId,
      customer_name: params[1] || 'Guest',
      items: typeof params[2] === 'string' ? JSON.parse(params[2]) : params[2],
      total_amount: parseFloat(params[3]),
      status: params[4] || 'Received',
      created_at: new Date().toISOString()
    };
    memoryFallback.orders.unshift(newOrder);
    return { rows: [newOrder] };
  }

  if (upper.includes('UPDATE ORDERS SET STATUS')) {
    const status = params[0];
    const rawId = params[1];
    const order = memoryFallback.orders.find(o => 
      String(o.id) === String(rawId) || 
      String(o.order_id).toLowerCase() === String(rawId).toLowerCase()
    );
    if (order) {
      order.status = status;
      return { rows: [order] };
    }
    return { rows: [] };
  }

  if (upper.includes('ORDERS') && (upper.includes('WHERE ID = $1') || upper.includes('WHERE ORDER_ID') || upper.includes('LOWER(ORDER_ID)'))) {
    const queryTerm = String(params[0]).toLowerCase().trim();
    const cleanNum = queryTerm.replace(/\D/g, '');
    const order = memoryFallback.orders.find(o => 
      String(o.order_id).toLowerCase() === queryTerm ||
      String(o.id) === queryTerm ||
      (cleanNum && String(o.id) === cleanNum)
    );
    return { rows: order ? [order] : [] };
  }

  // --- RESERVATIONS ---
  if (upper.startsWith('SELECT * FROM RESERVATIONS')) {
    return { rows: [...memoryFallback.reservations].sort((a, b) => b.id - a.id) };
  }

  if (upper.includes('INSERT INTO RESERVATIONS')) {
    const newRes = {
      id: (memoryFallback.reservations.length ? Math.max(...memoryFallback.reservations.map(r => r.id)) : 0) + 1,
      name: params[0],
      email: params[1],
      phone: params[2],
      guests: parseInt(params[3], 10),
      date: params[4],
      time: params[5],
      status: 'Confirmed',
      created_at: new Date().toISOString()
    };
    memoryFallback.reservations.unshift(newRes);
    return { rows: [newRes] };
  }

  return { rows: [] };
}

export { memoryFallback };
export default pool;