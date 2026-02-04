import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const CHECKINS_FILE = path.join(DATA_DIR, 'checkins.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

async function readCheckins() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CHECKINS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function readRegistrations() {
  try {
    const data = await fs.readFile(REGISTRATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeCheckins(data: any) {
  try {
    await ensureDataDir();
    await fs.writeFile(CHECKINS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing checkins:', error);
    return false;
  }
}

export async function GET() {
  try {
    const data = await readCheckins();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read checkins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const registrations = await readRegistrations();
    const checkins = await readCheckins();

    // Verify user ID exists
    const userExists = registrations.some(
      (r: any) => r.user_id && r.user_id.toUpperCase() === body.user_id.toUpperCase()
    );

    if (!userExists) {
      return NextResponse.json(
        { error: 'User ID not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    body.checkin_at = new Date().toISOString();
    checkins.push(body);

    if (await writeCheckins(checkins)) {
      return NextResponse.json({ success: true, data: body }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Failed to save check-in' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
