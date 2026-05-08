import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// Vercel Cron calls this — it just busts the /api/streams cache
// so the next real request gets fresh data from YouTube
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidatePath('/api/streams');

  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
