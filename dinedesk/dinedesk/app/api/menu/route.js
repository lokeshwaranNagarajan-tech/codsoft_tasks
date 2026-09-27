import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/menu: Fetch all menu items for both users and admin
export async function GET() {
  try {
    const result = await query(
      'SELECT id, name, category, price, COALESCE(status, CASE WHEN sold_out THEN \'Out of Stock\' ELSE \'Available\' END) AS status, sold_out, image FROM menu_items ORDER BY id ASC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[API /api/menu GET error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch menu items' }, { status: 500 });
  }
}

// POST /api/menu: Admin adds a new dish
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, price, image, status } = body;

    if (!name || price === undefined || price === null || price === '') {
      return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: 'Valid positive price is required' }, { status: 400 });
    }

    const dishCategory = category || 'Main Course';
    const dishImage = image || '🍽️';
    const dishStatus = status === 'Out of Stock' ? 'Out of Stock' : 'Available';
    const isSoldOut = dishStatus === 'Out of Stock';

    const result = await query(
      `INSERT INTO menu_items (name, category, price, status, sold_out, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, category, price, status, sold_out, image`,
      [name.trim(), dishCategory.trim(), numPrice, dishStatus, isSoldOut, dishImage]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[API /api/menu POST error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to create menu item' }, { status: 500 });
  }
}

// PUT / PATCH /api/menu: Admin updates dish details or status ('Available' vs 'Out of Stock')
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, category, price, image, status, sold_out } = body;

    if (id === undefined || id === null) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const numId = parseInt(id, 10);
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
        numId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('[API /api/menu PUT error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to update dish' }, { status: 500 });
  }
}

export async function PATCH(request) {
  return PUT(request);
}

// DELETE /api/menu: Admin removes a dish (via ?id=... or JSON body)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body may be empty
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Dish ID is required to delete' }, { status: 400 });
    }

    const numId = parseInt(id, 10);
    const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [numId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Dish removed successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('[API /api/menu DELETE error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to delete dish' }, { status: 500 });
  }
}