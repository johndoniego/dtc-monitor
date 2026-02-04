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
    const exists = registrations.some(
      (r: any) => r.email && r.email.toLowerCase() === body.email.toLowerCase()
    );
    return NextResponse.json({ exists });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
