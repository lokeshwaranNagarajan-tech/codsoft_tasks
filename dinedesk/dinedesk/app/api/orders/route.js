import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Helper: Normalize incoming status
function normalizeOrderStatus(rawStatus) {
  if (!rawStatus) return 'Received';
  const s = rawStatus.toLowerCase().trim();
  if (s === 'pending' || s === 'received') return 'Received';
  if (s === 'preparing' || s === 'prep') return 'Preparing';
  if (s === 'ready' || s === 'done') return 'Done';
  if (s === 'delivered') return 'Delivered';
  if (s === 'cancelled') return 'Cancelled';
  return rawStatus;
}

// GET /api/orders: Fetch all live orders for Admin / Kitchen, or single order by searchParams
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('orderId') || searchParams.get('id');
    const status = searchParams.get('status');

    if (queryId) {
      const cleanTerm = queryId.trim();
      const numOnly = parseInt(cleanTerm.replace(/\D/g, ''), 10);

      const result = await query(
        `SELECT id, COALESCE(order_id, 'ORD-' || id) AS order_id, customer_name, items, total_amount, status, created_at
         FROM orders
         WHERE LOWER(order_id) = LOWER($1) OR id = $2
         LIMIT 1`,
        [cleanTerm, isNaN(numOnly) ? -1 : numOnly]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: `Order ${cleanTerm} not found in database.` }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    }

    if (status) {
      const norm = normalizeOrderStatus(status);
      const result = await query(
        `SELECT id, COALESCE(order_id, 'ORD-' || id) AS order_id, customer_name, items, total_amount, status, created_at
         FROM orders
         WHERE LOWER(status) = LOWER($1)
         ORDER BY created_at DESC`,
        [norm]
      );
      return NextResponse.json(result.rows);
    }

    const result = await query(
      `SELECT id, COALESCE(order_id, 'ORD-' || id) AS order_id, customer_name, items, total_amount, status, created_at
       FROM orders
       ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[API /api/orders GET error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders: User places an order, generating a unique orderId
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer_name, items, total_amount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one dish item is required to place an order' }, { status: 400 });
    }

    const total = parseFloat(total_amount);
    if (isNaN(total) || total <= 0) {
      return NextResponse.json({ error: 'Valid positive total amount is required' }, { status: 400 });
    }

    // Generate unique, customer-friendly Order ID (e.g. ORD-7491)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const uniqueOrderId = `ORD-${randomSuffix}`;
    const customerName = (customer_name || 'Guest User').trim();
    const itemsJson = JSON.stringify(items);

    const result = await query(
      `INSERT INTO orders (order_id, customer_name, items, total_amount, status)
       VALUES ($1, $2, $3, $4, 'Received')
       RETURNING id, COALESCE(order_id, 'ORD-' || id) AS order_id, customer_name, items, total_amount, status, created_at`,
      [uniqueOrderId, customerName, itemsJson, total]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[API /api/orders POST error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}

// PUT / PATCH /api/orders: Admin / Kitchen updates order status ('Preparing', 'Done', 'Delivered')
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, orderId, order_id, status } = body;

    const targetId = orderId || order_id || id;
    if (!targetId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const cleanTerm = String(targetId).trim();
    const numOnly = parseInt(cleanTerm.replace(/\D/g, ''), 10);
    const newStatus = normalizeOrderStatus(status);

    const result = await query(
      `UPDATE orders
       SET status = $1
       WHERE LOWER(order_id) = LOWER($2) OR id = $3
       RETURNING id, COALESCE(order_id, 'ORD-' || id) AS order_id, customer_name, items, total_amount, status, created_at`,
      [newStatus, cleanTerm, isNaN(numOnly) ? -1 : numOnly]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('[API /api/orders PUT error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}

export async function PATCH(request) {
  return PUT(request);
}
