# WindowSurf.tv

**Turn any screen into somewhere else.**

Curated live streams from beaches, cities, airports, wildlife, space, and more.

## Deploy

```bash
# 1. Clone / download this project
# 2. Install dependencies
npm install

# 3. Run locally
npm run dev

# 4. Push to GitHub
git init
git add .
git commit -m "initial commit"
git remote add origin git@github.com:YOUR_USER/windowsurf-tv.git
git push -u origin main

# 5. Deploy on Vercel
# Connect the repo at vercel.com/new
# Point windowsurf.tv domain in Vercel project settings
```

## Stream Management

All streams live in `components/WindowSurf.jsx` in the `STREAMS` array. Each stream needs:

- `id` — unique number
- `title` — display name
- `videoId` — YouTube video ID (the part after `v=` or the live stream ID)
- `category` — one of: beaches, airports, cities, wildlife, space, trains, weird
- `location` — display location
- `vibe` — one of: chill, zen, chaos, intense

To update a dead stream, just swap the `videoId`. To add new streams, add an entry to the array.

## Notes

- YouTube live stream IDs rotate — check periodically and update dead ones
- Thumbnails pull from `img.youtube.com/vi/{videoId}/mqdefault.jpg`
- TV Mode auto-rotates every 2 minutes when enabled
