import { STREAMS } from '@/data/streams';
import { NextResponse } from 'next/server';

// Cache results for 30 minutes
export const revalidate = 1800;

async function checkLiveStatus(videoIds) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // No API key — return all streams as-is (fallback)
    return Object.fromEntries(videoIds.map(id => [id, 'unknown']));
  }

  const ids = videoIds.join(',');
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) {
    console.error('YouTube API error:', res.status, await res.text());
    return Object.fromEntries(videoIds.map(id => [id, 'unknown']));
  }

  const data = await res.json();
  const statusMap = {};

  // Mark everything not found in response as dead
  videoIds.forEach(id => { statusMap[id] = 'dead'; });

  data.items?.forEach(item => {
    statusMap[item.id] = item.snippet?.liveBroadcastContent ?? 'none';
    // "live"     = currently streaming
    // "upcoming" = scheduled, not started
    // "none"     = regular video / ended stream
  });

  return statusMap;
}

export async function GET() {
  try {
    const videoIds = STREAMS.map(s => s.videoId);
    const statusMap = await checkLiveStatus(videoIds);

    const streams = STREAMS.map(s => ({
      ...s,
      liveStatus: statusMap[s.videoId] ?? 'unknown',
    })).filter(s => s.liveStatus !== 'dead');

    return NextResponse.json({ streams, checkedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Stream check failed:', err);
    // Fallback: return all streams without status filtering
    return NextResponse.json({
      streams: STREAMS.map(s => ({ ...s, liveStatus: 'unknown' })),
      checkedAt: new Date().toISOString(),
      error: 'Status check unavailable',
    });
  }
}
