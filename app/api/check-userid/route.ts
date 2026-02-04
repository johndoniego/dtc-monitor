import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');

async function readRegistrations() {
  try {
    const data = await fs.readFile(REGISTRATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const registrations = await readRegistrations();
    const user = registrations.find(
      (r: any) => r.user_id && r.user_id.toUpperCase() === body.user_id.toUpperCase()
    );
    return NextResponse.json({ exists: !!user, user: user || null });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
