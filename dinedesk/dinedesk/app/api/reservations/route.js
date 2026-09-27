import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch reservations
export async function GET() {
  try {
    const result = await query('SELECT * FROM reservations ORDER BY date DESC, time DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[API /api/reservations GET error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to fetch reservations' }, { status: 500 });
  }
}

// POST: Book a table reservation
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, guests, date, time } = body;

    if (!name || !phone || !date || !time) {
      return NextResponse.json(
        { error: 'Name, phone, reservation date, and time are required' },
        { status: 400 }
      );
    }

    const numGuests = parseInt(guests, 10) || 2;
    if (numGuests < 1 || numGuests > 50) {
      return NextResponse.json({ error: 'Guests count must be between 1 and 50' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO reservations (name, email, phone, guests, date, time, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Confirmed')
       RETURNING *`,
      [name.trim(), email ? email.trim() : null, phone.trim(), numGuests, date, time]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('[API /api/reservations POST error]:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to create reservation' }, { status: 500 });
  }
}
