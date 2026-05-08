'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { STREAMS as BASE_STREAMS } from "@/data/streams";

const CAT_LABELS = {
  beaches: "BEACHES & SURF",
  airports: "AIRPORTS",
  cities: "CITIES",
  wildlife: "WILDLIFE",
  space: "SPACE",
  trains: "TRAINS & SHIPS",
  weird: "WEIRD & WONDERFUL",
};

const VB = {
  chill:   { l: "CHILL",   c: "#00e676" },
  zen:     { l: "ZEN",     c: "#7c4dff" },
  chaos:   { l: "CHAOS",   c: "#ff1493" },
  intense: { l: "INTENSE", c: "#ff8c00" },
};

function Globe({ spinning, landed, light }) {
  const g1 = light ? '#b8dfc8' : '#1a3a2a';
  const g2 = light ? '#ddf0e6' : '#0a1210';
  const g3 = light ? '#eef8f2' : '#060a08';
  const stroke = light ? '#009950' : '#00e676';
  const pinDot = light ? '#f4f4f8' : '#0a0a0f';
  return (
    <div className={`globe-wrap ${spinning ? 'globe-spin' : ''} ${landed ? 'globe-land' : ''}`}>
      <svg viewBox="0 0 200 200" width="200" height="200" className="globe-svg">
        <defs>
          <radialGradient id="glow" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor={g1} />
            <stop offset="70%" stopColor={g2} />
            <stop offset="100%" stopColor={g3} />
          </radialGradient>
          <clipPath id="circle-clip">
            <circle cx="100" cy="100" r="88" />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r="94" fill="none" stroke={stroke} strokeOpacity=".19" strokeWidth="1" />
        <circle cx="100" cy="100" r="92" fill="none" stroke={stroke} strokeOpacity=".08" strokeWidth="4" />
        <circle cx="100" cy="100" r="88" fill="url(#glow)" stroke={stroke} strokeWidth="1.5" />
        <g clipPath="url(#circle-clip)" opacity="0.4">
          <ellipse cx="100" cy="60" rx="85" ry="12" fill="none" stroke={stroke} strokeWidth="0.6" />
          <ellipse cx="100" cy="80" rx="88" ry="8" fill="none" stroke={stroke} strokeWidth="0.5" />
          <line x1="12" y1="100" x2="188" y2="100" stroke={stroke} strokeWidth="0.7" />
          <ellipse cx="100" cy="120" rx="88" ry="8" fill="none" stroke={stroke} strokeWidth="0.5" />
          <ellipse cx="100" cy="140" rx="85" ry="12" fill="none" stroke={stroke} strokeWidth="0.6" />
          <ellipse cx="100" cy="100" rx="30" ry="88" fill="none" stroke={stroke} strokeWidth="0.6" className="lon-1" />
          <ellipse cx="100" cy="100" rx="60" ry="88" fill="none" stroke={stroke} strokeWidth="0.6" className="lon-2" />
          <ellipse cx="100" cy="100" rx="88" ry="88" fill="none" stroke={stroke} strokeWidth="0.5" />
          <line x1="100" y1="12" x2="100" y2="188" stroke={stroke} strokeWidth="0.7" />
        </g>
        <ellipse cx="80" cy="75" rx="35" ry="50" fill="none" stroke={stroke} strokeOpacity=".13" strokeWidth="8" />
        <g clipPath="url(#circle-clip)" opacity="0.15">
          <path d="M60 70 Q70 55 90 60 Q100 65 95 80 Q85 90 70 85 Z" fill={stroke} className="cont-1" />
          <path d="M110 80 Q130 70 145 85 Q150 100 135 110 Q120 105 110 90 Z" fill={stroke} className="cont-2" />
          <path d="M80 110 Q95 105 100 115 Q105 130 90 135 Q75 125 80 110 Z" fill={stroke} className="cont-3" />
          <path d="M130 55 Q145 50 150 60 Q148 70 135 68 Z" fill={stroke} className="cont-4" />
        </g>
      </svg>
      <div className={`globe-pin ${landed ? 'pin-show' : ''}`}>
        <svg width="20" height="28" viewBox="0 0 20 28">
          <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.5 15.5 0 10 0z" fill="#ff1493" />
          <circle cx="10" cy="10" r="4" fill={pinDot} />
        </svg>
      </div>
    </div>
  );
}

export default function WindowSurf() {
  const [view, setView] = useState("roulette");
  const [cur, setCur] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const [rDisp, setRDisp] = useState(null);
  const [tvAuto, setTvAuto] = useState(false);
  const [streams, setStreams] = useState(BASE_STREAMS.map(s => ({ ...s, liveStatus: 'unknown' })));
  const [theme, setTheme] = useState('dark');
  const tmr = useRef(null);
  const light = theme === 'light';

  useEffect(() => {
    document.body.style.background = light ? '#f2f2f8' : '#0a0a0f';
  }, [light]);

  useEffect(() => {
    fetch('/api/streams')
      .then(r => r.json())
      .then(data => setStreams(data.streams))
      .catch(() => {});
  }, []);

  const livePool = useCallback(() => {
    const live = streams.filter(s => s.liveStatus === 'live' || s.liveStatus === 'unknown');
    return live.length > 0 ? live : streams;
  }, [streams]);

  const spin = useCallback(() => {
    const pool = livePool();
    setView("roulette"); setSpinning(true); setLanded(false); setRDisp(null);
    let c = 0;
    const iv = setInterval(() => {
      setRDisp(pool[Math.floor(Math.random() * pool.length)]);
      c++;
      if (c >= 20) {
        clearInterval(iv);
        const f = pool[Math.floor(Math.random() * pool.length)];
        setRDisp(f); setSpinning(false); setLanded(true);
        setTimeout(() => { setCur(f); setView("tv"); }, 2000);
      }
    }, 100 + c * 12);
  }, [livePool]);

  const spinAgain = useCallback(() => {
    const pool = livePool();
    const s = pool[Math.floor(Math.random() * pool.length)];
    if (s) setCur(s);
  }, [livePool]);

  const exitTv = useCallback(() => {
    setView("roulette"); setSpinning(false); setLanded(false); setRDisp(null);
  }, []);

  useEffect(() => {
    if (view === "tv" && tvAuto) {
      tmr.current = setInterval(() => {
        const pool = livePool();
        const s = pool[Math.floor(Math.random() * pool.length)];
        if (s) setCur(s);
      }, 120000);
      return () => clearInterval(tmr.current);
    }
    return () => clearInterval(tmr.current);
  }, [view, tvAuto, livePool]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Barlow+Condensed:wght@600;700;800;900&family=Permanent+Marker&family=Barlow:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}

        body{background:#0a0a0f;transition:background .3s}

        /* DARK THEME (default) */
        .ws{
          --bg:#0a0a0f;
          --text:#c8c8d0;
          --text-hi:#e0e0e8;
          --text-lo:#505060;
          --text-dim:#707080;
          --border:#1a1a28;
          --border-mid:#2a2a3a;
          --g:#00e676;
          --p:#ff1493;
          --v:#7c4dff;
          --grid:rgba(255,255,255,.02);
          --marg:#6a6a80;
          --marg-hov:#9090a8;
          --spb-hov:#00e67615;
          --spb-glow:#00e67622;
          --globe-shadow:#00e67618;
          --globe-land-shadow:#00e67635;
        }

        /* LIGHT THEME */
        .ws.light{
          --bg:#f2f2f8;
          --text:#4a4a65;
          --text-hi:#1a1a30;
          --text-lo:#8080a0;
          --text-dim:#9090b8;
          --border:#d0d0e4;
          --border-mid:#b8b8d0;
          --g:#009950;
          --p:#cc0060;
          --v:#5c2ec8;
          --grid:rgba(0,0,0,.04);
          --marg:#8080a8;
          --marg-hov:#5a5a80;
          --spb-hov:#00995015;
          --spb-glow:#00995022;
          --globe-shadow:rgba(0,140,70,.15);
          --globe-land-shadow:rgba(0,140,70,.25);
        }

        .ws{font-family:'Barlow',sans-serif;min-height:100vh;background:var(--bg);color:var(--text);position:relative;overflow:hidden;transition:background .3s,color .3s}
        .ws::before{content:'';position:fixed;inset:0;
          background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
          background-size:60px 60px;pointer-events:none;z-index:0}
        .z1{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column}

        /* HEADER ROW */
        .hdr{display:flex;justify-content:space-between;align-items:center;padding-right:20px}
        .logo{padding:20px 28px;display:flex;align-items:baseline;gap:0;user-select:none}
        .lg-w{font-family:'Archivo Black',sans-serif;font-size:22px;color:var(--text-hi);letter-spacing:-1px;text-transform:uppercase;transition:color .3s}
        .lg-s{font-family:'Permanent Marker',cursive;font-size:24px;color:var(--p);margin-left:2px;transform:rotate(-2deg);display:inline-block;transition:color .3s}
        .lg-tv{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:10px;color:#0b1a2e;background:#ffe500;padding:1px 5px;border-radius:3px;margin-left:5px;letter-spacing:1.5px;transform:rotate(2deg) translateY(-2px);display:inline-block}

        /* THEME TOGGLE */
        .thm{background:none;border:1px solid var(--border-mid);color:var(--text-dim);font-size:15px;width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;border-radius:4px;flex-shrink:0}
        .thm:hover{border-color:var(--g);color:var(--g)}

        /* ROULETTE */
        .rou{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 24px;text-align:center;gap:0}
        .rou-lb{font-family:'Space Mono',monospace;font-size:10px;color:var(--g);letter-spacing:4px;text-transform:uppercase;margin-bottom:36px;opacity:.8;min-height:16px;transition:color .3s}
        .globe-wrap{position:relative;margin-bottom:32px}
        .globe-svg{filter:drop-shadow(0 0 24px var(--globe-shadow));transition:filter .3s}
        .globe-spin .globe-svg{animation:gspin .6s linear infinite}
        .globe-spin .globe-svg .lon-1{animation:lshift .3s linear infinite}
        .globe-spin .globe-svg .lon-2{animation:lshift .3s .15s linear infinite}
        .globe-spin .globe-svg .cont-1,.globe-spin .globe-svg .cont-2,.globe-spin .globe-svg .cont-3,.globe-spin .globe-svg .cont-4{animation:cflick .15s linear infinite alternate}
        @keyframes gspin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
        @keyframes lshift{0%{rx:30}50%{rx:10}100%{rx:30}}
        @keyframes cflick{0%{opacity:.15}100%{opacity:.05}}
        .globe-land .globe-svg{animation:gstop .8s ease-out forwards;filter:drop-shadow(0 0 40px var(--globe-land-shadow))}
        @keyframes gstop{0%{transform:rotateY(720deg)}100%{transform:rotateY(0)}}
        .globe-pin{position:absolute;top:30%;left:50%;transform:translate(-50%,-100%) scale(0);opacity:0;transition:all .4s cubic-bezier(.34,1.56,.64,1)}
        .pin-show{transform:translate(-50%,-100%) scale(1);opacity:1}
        .r-info{min-height:90px;margin-bottom:28px}
        .rc{font-family:'Space Mono',monospace;font-size:10px;color:var(--v);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;min-height:14px;transition:color .3s}
        .rn{font-family:'Archivo Black',sans-serif;font-size:26px;color:var(--text-hi);text-transform:uppercase;min-height:32px;letter-spacing:-.5px;transition:color .3s}
        .rlo{font-family:'Space Mono',monospace;font-size:11px;color:var(--text-lo);margin-top:6px;min-height:16px;transition:color .3s}
        .spb{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:14px;padding:11px 40px;
          border:1px solid var(--g);background:transparent;color:var(--g);cursor:pointer;transition:all .2s;
          text-transform:uppercase;letter-spacing:2px}
        .spb:hover:not(:disabled){background:var(--spb-hov);box-shadow:0 0 24px var(--spb-glow)}
        .spb:disabled{opacity:.25;cursor:not-allowed}

        /* PLAYER (kept for potential use) */
        .pw{flex:1;display:flex;flex-direction:column;padding:0 24px 24px;max-width:1000px;width:100%;margin:0 auto}
        .pt{display:flex;justify-content:space-between;align-items:center;padding:12px 0 14px}
        .pf{width:100%;aspect-ratio:16/9;border:1px solid var(--border);overflow:hidden;background:#000;box-shadow:0 0 40px rgba(0,0,0,.7)}
        .pf iframe{width:100%;height:100%;border:none}
        .pm{margin-top:16px;display:flex;justify-content:space-between;align-items:center;gap:12px}
        .pm-t{font-family:'Archivo Black',sans-serif;font-size:22px;color:var(--text-hi);text-transform:uppercase;letter-spacing:-.5px}
        .pm-l{font-family:'Space Mono',monospace;font-size:11px;color:var(--text-lo);margin-top:3px}
        .vb{display:inline-block;font-family:'Space Mono',monospace;font-size:9px;padding:2px 8px;color:#0a0a0f;margin-top:7px;text-transform:uppercase;letter-spacing:1px;font-weight:700}
        .pa{display:flex;gap:8px;align-items:center;flex-shrink:0}
        .ab{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;padding:8px 16px;
          border:1px solid var(--border-mid);background:transparent;cursor:pointer;transition:all .15s;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:1px}
        .ab:hover{border-color:var(--g);color:var(--g)}
        .ab.spin{border-color:var(--g);color:var(--g);background:var(--spb-hov);font-size:13px;padding:9px 22px;letter-spacing:1.5px}
        .ab.tv{border-color:var(--v);color:var(--v)}

        /* TV MODE — always dark */
        .tv{position:fixed;inset:0;background:#000;z-index:100;display:flex;flex-direction:column}
        .tv-p{flex:1;position:relative}
        .tv-p iframe{width:100%;height:100%;border:none}
        .tv-c{position:absolute;bottom:0;left:0;right:0;padding:20px 24px;background:linear-gradient(transparent,rgba(0,0,0,.85));display:flex;justify-content:space-between;align-items:center}
        .tv-t{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:16px;text-transform:uppercase;color:#fff;letter-spacing:1px}
        .tv-l{font-family:'Space Mono',monospace;font-size:10px;color:rgba(255,255,255,.4)}
        .tv-bs{display:flex;gap:6px}
        .tvb{font-family:'Space Mono',monospace;font-size:10px;padding:6px 14px;border:1px solid rgba(255,255,255,.15);background:transparent;color:rgba(255,255,255,.7);cursor:pointer;transition:all .15s;text-transform:uppercase;letter-spacing:1px;backdrop-filter:blur(4px)}
        .tvb:hover{border-color:rgba(255,255,255,.4);color:#fff}
        .tvb.ex{border-color:#ff149360;color:#ff1493}
        .tvb.ex:hover{background:#ff149315}
        .tvb.ao{border-color:#00e67660;color:#00e676;background:#00e67610}

        .footer{padding:16px 28px;display:flex;justify-content:flex-end;align-items:center}
        .marg{font-family:'Space Mono',monospace;font-size:10px;color:var(--marg);text-decoration:none;letter-spacing:1px;transition:color .2s}
        .marg:hover{color:var(--marg-hov)}

        @media(max-width:600px){
          .logo{padding:16px 18px}
          .lg-w{font-size:18px}.lg-s{font-size:20px}
          .rn{font-size:20px}
          .pw{padding:0 16px 20px}
          .hdr{padding-right:14px}
        }
      `}</style>

      <div className={`ws${light ? ' light' : ''}`}><div className="z1">

        {/* TV MODE */}
        {view === "tv" && cur ? (
          <div className="tv">
            <div className="tv-p">
              <iframe src={`https://www.youtube.com/embed/${cur.videoId}?autoplay=1&mute=1&rel=0&controls=0`} allow="autoplay; encrypted-media" allowFullScreen title={cur.title} />
              <div className="tv-c">
                <div><div className="tv-t">{cur.title}</div><div className="tv-l">{cur.location}</div></div>
                <div className="tv-bs">
                  <button className={`tvb ${tvAuto?'ao':''}`} onClick={()=>setTvAuto(p=>!p)}>{tvAuto?"Auto ON":"Auto-rotate"}</button>
                  <button className="tvb" onClick={()=>{ const pool=livePool(); const s=pool[Math.floor(Math.random()*pool.length)]; if(s)setCur(s); }}>Next</button>
                  <button className="tvb ex" onClick={exitTv}>Exit</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="hdr">
              <div className="logo">
                <span className="lg-w">Window</span><span className="lg-s">Surf</span><span className="lg-tv">.TV</span>
              </div>
              <button className="thm" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} title="Toggle theme">
                {light ? '☾' : '☀'}
              </button>
            </div>

            {/* GLOBE ROULETTE */}
            {view === "roulette" && (
              <div className="rou">
                <div className="rou-lb">
                  {spinning ? "Spinning the globe..." : landed ? "Taking you there..." : "Spin the globe. Go somewhere."}
                </div>
                <Globe spinning={spinning} landed={landed} light={light} />
                <div className="r-info">
                  <div className="rc">{rDisp ? CAT_LABELS[rDisp.category] || "" : ""}</div>
                  <div className="rn">{rDisp?.title || ""}</div>
                  <div className="rlo">{rDisp?.location || ""}</div>
                </div>
                <button className="spb" onClick={spin} disabled={spinning || landed}>
                  {spinning ? "..." : "Spin"}
                </button>
              </div>
            )}
          </>
        )}

        <div className="footer">
          <a className="marg" href="https://venmo.com/thefake_np" target="_blank" rel="noopener noreferrer">🍹 buy me a margarita</a>
        </div>
      </div></div>
    </>
  );
}
