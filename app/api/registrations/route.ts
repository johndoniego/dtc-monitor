import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

async function readRegistrations() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(REGISTRATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeRegistrations(data: any) {
  try {
    await ensureDataDir();
    await fs.writeFile(REGISTRATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing registrations:', error);
    return false;
  }
}

export async function GET() {
  try {
    const data = await readRegistrations();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read registrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const registrations = await readRegistrations();

    // Check for duplicate email
    const emailExists = registrations.some(
      (r: any) => r.email && r.email.toLowerCase() === body.email.toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 400 }
      );
    }

    // Add registration number
    const maxRegNum = registrations.length > 0
      ? Math.max(...registrations.map((r: any) => r.registration_number || 0))
      : 0;
    body.registration_number = maxRegNum + 1;

    // Generate user ID
    let maxIdNum = 0;
    registrations.forEach((r: any) => {
      if (r.user_id) {
        const numPart = r.user_id.split('-')[1];
        if (numPart) {
          const numVal = parseInt(numPart, 36);
          if (numVal > maxIdNum) maxIdNum = numVal;
        }
      }
    });
    body.user_id = 'DT-' + (maxIdNum + 1).toString(36).toUpperCase().padStart(5, '0');
    body.registered_at = new Date().toISOString();

    registrations.push(body);

    if (await writeRegistrations(registrations)) {
      return NextResponse.json({ success: true, data: body }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Failed to save registration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
