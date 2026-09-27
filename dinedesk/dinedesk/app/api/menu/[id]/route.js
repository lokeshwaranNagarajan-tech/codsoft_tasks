import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT /api/menu/:id: Admin updates dish details or status
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid dish ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, category, price, image, status, sold_out } = body;

    let newStatus = status;
    if (!newStatus && sold_out !== undefined) {
      newStatus = sold_out ? 'Out of Stock' : 'Available';
    }
    newStatus = newStatus === 'Out of Stock' ? 'Out of Stock' : 'Available';
    const isSoldOut = newStatus === 'Out of Stock';

    const result = await query(
      `UPDATE menu_items 
       SET status = $1, 
           sold_out = $2,
           name = COALESCE($3, name),
           category = COALESCE($4, category),
           price = COALESCE($5, price),
           image = COALESCE($6, image)
       WHERE id = $7
       RETURNING id, name, category, price, status, sold_out, image`,
      [
        newStatus,
        isSoldOut,
        name ? name.trim() : null,
        category ? category.trim() : null,
        price !== undefined ? parseFloat(price) : null,
        image || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[API /api/menu/:id PUT error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to update dish' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}

// DELETE /api/menu/:id: Admin removes dish
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid dish ID' }, { status: 400 });
    }

    const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Dish deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('[API /api/menu/:id DELETE error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to delete dish' }, { status: 500 });
  }
}
