import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

// GET /api/orders/:orderId: User tracks order status
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const cleanId = String(resolvedParams.id).trim();
    const numOnly = parseInt(cleanId.replace(/\D/g, ''), 10);

    const result = await query(
      `SELECT id, COALESCE(order_id, 'ORD-' || id) AS order_id, customer_name, items, total_amount, status, created_at
       FROM orders
       WHERE LOWER(order_id) = LOWER($1) OR id = $2
       LIMIT 1`,
      [cleanId, isNaN(numOnly) ? -1 : numOnly]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: `Order ${cleanId} not found in database.` }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[API /api/orders/:orderId GET error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/:id: Admin updates order status
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const cleanId = String(resolvedParams.id).trim();
    const numOnly = parseInt(cleanId.replace(/\D/g, ''), 10);

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const newStatus = normalizeOrderStatus(status);

    const result = await query(
      `UPDATE orders
       SET status = $1
       WHERE LOWER(order_id) = LOWER($2) OR id = $3
       RETURNING id, COALESCE(order_id, 'ORD-' || id) AS order_id, customer_name, items, total_amount, status, created_at`,
      [newStatus, cleanId, isNaN(numOnly) ? -1 : numOnly]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[API /api/orders/:id PUT error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}
