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

function Globe({ spinning, landed }) {
  return (
    <div className={`globe-wrap ${spinning ? 'globe-spin' : ''} ${landed ? 'globe-land' : ''}`}>
      <svg viewBox="0 0 200 200" width="200" height="200" className="globe-svg">
        <defs>
          <radialGradient id="glow" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="70%" stopColor="#0a1210" />
            <stop offset="100%" stopColor="#060a08" />
          </radialGradient>
          <clipPath id="circle-clip">
            <circle cx="100" cy="100" r="88" />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r="94" fill="none" stroke="#00e67630" strokeWidth="1" />
        <circle cx="100" cy="100" r="92" fill="none" stroke="#00e67615" strokeWidth="4" />
        <circle cx="100" cy="100" r="88" fill="url(#glow)" stroke="#00e676" strokeWidth="1.5" />
        <g clipPath="url(#circle-clip)" opacity="0.4">
          <ellipse cx="100" cy="60" rx="85" ry="12" fill="none" stroke="#00e676" strokeWidth="0.6" />
          <ellipse cx="100" cy="80" rx="88" ry="8" fill="none" stroke="#00e676" strokeWidth="0.5" />
          <line x1="12" y1="100" x2="188" y2="100" stroke="#00e676" strokeWidth="0.7" />
          <ellipse cx="100" cy="120" rx="88" ry="8" fill="none" stroke="#00e676" strokeWidth="0.5" />
          <ellipse cx="100" cy="140" rx="85" ry="12" fill="none" stroke="#00e676" strokeWidth="0.6" />
          <ellipse cx="100" cy="100" rx="30" ry="88" fill="none" stroke="#00e676" strokeWidth="0.6" className="lon-1" />
          <ellipse cx="100" cy="100" rx="60" ry="88" fill="none" stroke="#00e676" strokeWidth="0.6" className="lon-2" />
          <ellipse cx="100" cy="100" rx="88" ry="88" fill="none" stroke="#00e676" strokeWidth="0.5" />
          <line x1="100" y1="12" x2="100" y2="188" stroke="#00e676" strokeWidth="0.7" />
        </g>
        <ellipse cx="80" cy="75" rx="35" ry="50" fill="none" stroke="#00e67620" strokeWidth="8" />
        <g clipPath="url(#circle-clip)" opacity="0.15">
          <path d="M60 70 Q70 55 90 60 Q100 65 95 80 Q85 90 70 85 Z" fill="#00e676" className="cont-1" />
          <path d="M110 80 Q130 70 145 85 Q150 100 135 110 Q120 105 110 90 Z" fill="#00e676" className="cont-2" />
          <path d="M80 110 Q95 105 100 115 Q105 130 90 135 Q75 125 80 110 Z" fill="#00e676" className="cont-3" />
          <path d="M130 55 Q145 50 150 60 Q148 70 135 68 Z" fill="#00e676" className="cont-4" />
        </g>
      </svg>
      <div className={`globe-pin ${landed ? 'pin-show' : ''}`}>
        <svg width="20" height="28" viewBox="0 0 20 28">
          <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 18 10 18s10-10.5 10-18C20 4.5 15.5 0 10 0z" fill="#ff1493" />
          <circle cx="10" cy="10" r="4" fill="#0a0a0f" />
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
  const tmr = useRef(null);

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
        setTimeout(() => { setCur(f); setView("player"); }, 2000);
      }
    }, 100 + c * 12);
  }, [livePool]);

  const exitTv = useCallback(() => {
    setView("roulette"); setSpinning(false); setLanded(false); setRDisp(null);
  }, []);

  // TV auto-rotate using live pool
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

        body{background:#0a0a0f}

        .ws{font-family:'Barlow',sans-serif;min-height:100vh;background:#0a0a0f;color:#c8c8d0;position:relative;overflow:hidden}
        .ws::before{content:'';position:fixed;inset:0;
          background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);
          background-size:60px 60px;pointer-events:none;z-index:0}
        .z1{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column}

        /* LOGO — always top-left */
        .logo{padding:20px 28px;display:flex;align-items:baseline;gap:0;user-select:none}
        .lg-w{font-family:'Archivo Black',sans-serif;font-size:22px;color:#fff;letter-spacing:-1px;text-transform:uppercase}
        .lg-s{font-family:'Permanent Marker',cursive;font-size:24px;color:#ff1493;margin-left:2px;transform:rotate(-2deg);display:inline-block}
        .lg-tv{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:10px;color:#0b1a2e;background:#ffe500;padding:1px 5px;border-radius:3px;margin-left:5px;letter-spacing:1.5px;transform:rotate(2deg) translateY(-2px);display:inline-block}

        /* ROULETTE — full screen centered */
        .rou{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 24px;text-align:center;gap:0}
        .rou-lb{font-family:'Space Mono',monospace;font-size:10px;color:#00e676;letter-spacing:4px;text-transform:uppercase;margin-bottom:36px;opacity:.7;min-height:16px}
        .globe-wrap{position:relative;margin-bottom:32px}
        .globe-svg{filter:drop-shadow(0 0 24px #00e67618)}
        .globe-spin .globe-svg{animation:gspin .6s linear infinite}
        .globe-spin .globe-svg .lon-1{animation:lshift .3s linear infinite}
        .globe-spin .globe-svg .lon-2{animation:lshift .3s .15s linear infinite}
        .globe-spin .globe-svg .cont-1,.globe-spin .globe-svg .cont-2,.globe-spin .globe-svg .cont-3,.globe-spin .globe-svg .cont-4{animation:cflick .15s linear infinite alternate}
        @keyframes gspin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
        @keyframes lshift{0%{rx:30}50%{rx:10}100%{rx:30}}
        @keyframes cflick{0%{opacity:.15}100%{opacity:.05}}
        .globe-land .globe-svg{animation:gstop .8s ease-out forwards;filter:drop-shadow(0 0 40px #00e67635)}
        @keyframes gstop{0%{transform:rotateY(720deg)}100%{transform:rotateY(0)}}
        .globe-pin{position:absolute;top:30%;left:50%;transform:translate(-50%,-100%) scale(0);opacity:0;transition:all .4s cubic-bezier(.34,1.56,.64,1)}
        .pin-show{transform:translate(-50%,-100%) scale(1);opacity:1}
        .r-info{min-height:90px;margin-bottom:28px}
        .rc{font-family:'Space Mono',monospace;font-size:10px;color:#7c4dff;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;min-height:14px}
        .rn{font-family:'Archivo Black',sans-serif;font-size:26px;color:#e0e0e8;text-transform:uppercase;min-height:32px;letter-spacing:-.5px}
        .rlo{font-family:'Space Mono',monospace;font-size:11px;color:#505060;margin-top:6px;min-height:16px}
        .spb{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:14px;padding:11px 40px;
          border:1px solid #00e676;background:transparent;color:#00e676;cursor:pointer;transition:all .2s;
          text-transform:uppercase;letter-spacing:2px}
        .spb:hover:not(:disabled){background:#00e67615;box-shadow:0 0 24px #00e67622}
        .spb:disabled{opacity:.25;cursor:not-allowed}

        /* PLAYER */
        .pw{flex:1;display:flex;flex-direction:column;padding:0 24px 24px;max-width:1000px;width:100%;margin:0 auto}
        .pt{display:flex;justify-content:space-between;align-items:center;padding:12px 0 14px}
        .pf{width:100%;aspect-ratio:16/9;border:1px solid #1a1a28;overflow:hidden;background:#000;box-shadow:0 0 40px rgba(0,0,0,.7)}
        .pf iframe{width:100%;height:100%;border:none}
        .pm{margin-top:16px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px}
        .pm-t{font-family:'Archivo Black',sans-serif;font-size:22px;color:#e0e0e8;text-transform:uppercase;letter-spacing:-.5px}
        .pm-l{font-family:'Space Mono',monospace;font-size:11px;color:#505060;margin-top:3px}
        .vb{display:inline-block;font-family:'Space Mono',monospace;font-size:9px;padding:2px 8px;color:#0a0a0f;margin-top:7px;text-transform:uppercase;letter-spacing:1px;font-weight:700}
        .pa{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
        .ab{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;padding:8px 16px;
          border:1px solid #2a2a3a;background:transparent;cursor:pointer;transition:all .15s;
          color:#808090;text-transform:uppercase;letter-spacing:1px}
        .ab:hover{border-color:#00e676;color:#00e676}
        .ab.spin{border-color:#00e676;color:#00e676;background:#00e67610;font-size:13px;padding:9px 22px;letter-spacing:1.5px}
        .ab.spin:hover{background:#00e67620;box-shadow:0 0 16px #00e67620}
        .ab.tv{border-color:#7c4dff;color:#7c4dff}
        .ab.tv:hover{background:#7c4dff12}

        /* TV MODE */
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
        .marg{font-family:'Space Mono',monospace;font-size:10px;color:#303040;text-decoration:none;letter-spacing:1px;transition:color .2s}
        .marg:hover{color:#505060}

        @media(max-width:600px){
          .logo{padding:16px 18px}
          .lg-w{font-size:18px}.lg-s{font-size:20px}
          .rn{font-size:20px}
          .pw{padding:0 16px 20px}
        }
      `}</style>

      <div className="ws"><div className="z1">

        {/* TV MODE */}
        {view === "tv" && cur ? (
          <div className="tv">
            <div className="tv-p">
              <iframe src={`https://www.youtube.com/embed/${cur.videoId}?autoplay=1&mute=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen title={cur.title} />
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
            {/* LOGO */}
            <div className="logo">
              <span className="lg-w">Window</span><span className="lg-s">Surf</span><span className="lg-tv">.TV</span>
            </div>

            {/* GLOBE ROULETTE */}
            {view === "roulette" && (
              <div className="rou">
                <div className="rou-lb">
                  {spinning ? "Spinning the globe..." : landed ? "Taking you there..." : "Spin the globe. Go somewhere."}
                </div>
                <Globe spinning={spinning} landed={landed} />
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

            {/* PLAYER */}
            {view === "player" && cur && (
              <div className="pw">
                <div className="pt">
                  <div className="logo" style={{padding:0}}>
                    <span className="lg-w" style={{fontSize:18}}>Window</span><span className="lg-s" style={{fontSize:20}}>Surf</span><span className="lg-tv">.TV</span>
                  </div>
                </div>
                <div className="pf">
                  <iframe src={`https://www.youtube.com/embed/${cur.videoId}?autoplay=1&mute=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen title={cur.title} />
                </div>
                <div className="pm">
                  <div>
                    <div className="pm-t">{cur.title}</div>
                    <div className="pm-l">{cur.location}</div>
                    <span className="vb" style={{background:VB[cur.vibe]?.c||"#888"}}>{VB[cur.vibe]?.l}</span>
                  </div>
                  <div className="pa">
                    <button className="ab spin" onClick={spin}>Spin Again</button>
                    <button className="ab tv" onClick={()=>setView("tv")}>Full Screen</button>
                  </div>
                </div>
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
