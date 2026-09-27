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

// PUT /api/orders/:id/status: Admin/Kitchen updates order status directly
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
    console.error('[API /api/orders/:id/status PUT error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}
