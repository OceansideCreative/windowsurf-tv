'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { STREAMS as BASE_STREAMS } from "@/data/streams";

const CATS = [
  { id: "beaches", label: "BEACHES & SURF", color: "#00e676", tag: "Salt life forever" },
  { id: "airports", label: "AIRPORTS", color: "#7c4dff", tag: "Criminally addictive" },
  { id: "cities", label: "CITIES", color: "#00d4ff", tag: "Plug into civilization" },
  { id: "wildlife", label: "WILDLIFE", color: "#00e676", tag: "Better than reality TV" },
  { id: "space", label: "SPACE", color: "#7c4dff", tag: "Question your existence" },
  { id: "trains", label: "TRAINS & SHIPS", color: "#00d4ff", tag: "Cozy productivity fuel" },
  { id: "weird", label: "WEIRD & WONDERFUL", color: "#ff1493", tag: "Leave it on all day" },
];

const VB = {
  chill: { l: "CHILL", c: "#00e676" },
  zen: { l: "ZEN", c: "#7c4dff" },
  chaos: { l: "CHAOS", c: "#ff1493" },
  intense: { l: "INTENSE", c: "#ff8c00" },
};

/* Spinning Globe SVG component */
function Globe({ spinning, landed }) {
  return (
    <div className={`globe-wrap ${spinning ? 'globe-spin' : ''} ${landed ? 'globe-land' : ''}`}>
      <svg viewBox="0 0 200 200" width="160" height="160" className="globe-svg">
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
        {/* Outer glow */}
        <circle cx="100" cy="100" r="94" fill="none" stroke="#00e67630" strokeWidth="1" />
        <circle cx="100" cy="100" r="92" fill="none" stroke="#00e67615" strokeWidth="4" />
        {/* Globe body */}
        <circle cx="100" cy="100" r="88" fill="url(#glow)" stroke="#00e676" strokeWidth="1.5" />
        {/* Grid lines clipped to circle */}
        <g clipPath="url(#circle-clip)" opacity="0.4">
          {/* Latitude lines */}
          <ellipse cx="100" cy="60" rx="85" ry="12" fill="none" stroke="#00e676" strokeWidth="0.6" />
          <ellipse cx="100" cy="80" rx="88" ry="8" fill="none" stroke="#00e676" strokeWidth="0.5" />
          <line x1="12" y1="100" x2="188" y2="100" stroke="#00e676" strokeWidth="0.7" />
          <ellipse cx="100" cy="120" rx="88" ry="8" fill="none" stroke="#00e676" strokeWidth="0.5" />
          <ellipse cx="100" cy="140" rx="85" ry="12" fill="none" stroke="#00e676" strokeWidth="0.6" />
          {/* Longitude lines */}
          <ellipse cx="100" cy="100" rx="30" ry="88" fill="none" stroke="#00e676" strokeWidth="0.6" className="lon-1" />
          <ellipse cx="100" cy="100" rx="60" ry="88" fill="none" stroke="#00e676" strokeWidth="0.6" className="lon-2" />
          <ellipse cx="100" cy="100" rx="88" ry="88" fill="none" stroke="#00e676" strokeWidth="0.5" />
          <line x1="100" y1="12" x2="100" y2="188" stroke="#00e676" strokeWidth="0.7" />
        </g>
        {/* Highlight arc */}
        <ellipse cx="80" cy="75" rx="35" ry="50" fill="none" stroke="#00e67620" strokeWidth="8" />
        {/* Continent hint shapes */}
        <g clipPath="url(#circle-clip)" opacity="0.15">
          <path d="M60 70 Q70 55 90 60 Q100 65 95 80 Q85 90 70 85 Z" fill="#00e676" className="cont-1" />
          <path d="M110 80 Q130 70 145 85 Q150 100 135 110 Q120 105 110 90 Z" fill="#00e676" className="cont-2" />
          <path d="M80 110 Q95 105 100 115 Q105 130 90 135 Q75 125 80 110 Z" fill="#00e676" className="cont-3" />
          <path d="M130 55 Q145 50 150 60 Q148 70 135 68 Z" fill="#00e676" className="cont-4" />
        </g>
      </svg>
      {/* Pin marker */}
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
  const [view, setView] = useState("home");
  const [selCat, setSelCat] = useState(null);
  const [cur, setCur] = useState(null);
  const [favs, setFavs] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const [rDisp, setRDisp] = useState(null);
  const [tvAuto, setTvAuto] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [streams, setStreams] = useState(BASE_STREAMS.map(s => ({ ...s, liveStatus: 'unknown' })));
  const [statusLoaded, setStatusLoaded] = useState(false);
  const tmr = useRef(null);

  // Fetch live status from API on mount
  useEffect(() => {
    fetch('/api/streams')
      .then(r => r.json())
      .then(data => { setStreams(data.streams); setStatusLoaded(true); })
      .catch(() => setStatusLoaded(true));
  }, []);

  const play = useCallback((s) => { setCur(s); setView("player"); }, []);
  const rnd = useCallback(() => { const s = streams[Math.floor(Math.random() * streams.length)]; setCur(s); return s; }, [streams]);

  const spin = useCallback(() => {
    setView("roulette"); setSpinning(true); setLanded(false); setRDisp(null);
    let c = 0;
    const iv = setInterval(() => {
      setRDisp(streams[Math.floor(Math.random() * streams.length)]);
      c++;
      if (c >= 20) {
        clearInterval(iv);
        const f = streams[Math.floor(Math.random() * streams.length)];
        setRDisp(f); setSpinning(false); setLanded(true);
        setTimeout(() => { setCur(f); setView("player"); }, 2000);
      }
    }, 100 + c * 12);
  }, [streams]);

  const togFav = useCallback((s) => {
    setFavs(p => p.find(f => f.id === s.id) ? p.filter(f => f.id !== s.id) : [...p, s]);
  }, []);
  const isF = (s) => favs.some(f => f.id === s.id);

  useEffect(() => {
    if (view === "tv" && tvAuto) { tmr.current = setInterval(() => rnd(), 120000); return () => clearInterval(tmr.current); }
    return () => clearInterval(tmr.current);
  }, [view, tvAuto, rnd]);

  const catS = selCat ? streams.filter(s => s.category === selCat) : [];

  const Card = ({ s }) => {
    const isLive = s.liveStatus === 'live';
    const isUnknown = s.liveStatus === 'unknown';
    return (
      <div className={`sc ${!isLive && !isUnknown && statusLoaded ? 'sc-dim' : ''}`} onClick={() => play(s)}>
        <div className="sc-th">
          <img src={`https://img.youtube.com/vi/${s.videoId}/mqdefault.jpg`} alt={s.title} onError={e => { e.target.style.display = 'none'; }} />
          {(isLive || isUnknown) && <div className="lv"><span className="ld" />{isLive ? 'LIVE' : '•••'}</div>}
          {!isLive && !isUnknown && statusLoaded && <div className="lv lv-off">OFFLINE</div>}
        </div>
        <div className="sc-i">
          <div className="sc-t">{s.title}</div>
          <div className="sc-l">{s.location}</div>
          <span className="vb" style={{ background: VB[s.vibe]?.c || "#888" }}>{VB[s.vibe]?.l}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Barlow+Condensed:wght@600;700;800;900&family=Permanent+Marker&family=Barlow:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}

        .ws{font-family:'Barlow',sans-serif;min-height:100vh;background:#0a0a0f;color:#c8c8d0;position:relative;overflow-x:hidden}

        /* Subtle grid bg */
        .ws::before{content:'';position:fixed;top:0;left:0;right:0;bottom:0;
          background-image:
            linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
          background-size:60px 60px;
          pointer-events:none;z-index:0}
        .z1{position:relative;z-index:1}

        /* HEADER — logo colors locked */
        .hd{padding:14px 24px;display:flex;align-items:center;justify-content:space-between;
          border-bottom:1px solid #1a1a28;background:#0d0d14}
        .lg{display:flex;align-items:center;cursor:pointer;user-select:none}
        .lg-w{font-family:'Archivo Black',sans-serif;font-size:26px;color:#fff;letter-spacing:-1px;text-transform:uppercase}
        .lg-s{font-family:'Permanent Marker',cursive;font-size:28px;color:#ff1493;margin-left:3px;transform:rotate(-2deg);display:inline-block}
        .lg-tv{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:11px;color:#0b1a2e;background:#ffe500;padding:2px 6px;border-radius:3px;margin-left:6px;letter-spacing:1.5px;transform:rotate(2deg) translateY(-2px);display:inline-block}
        .tl{font-family:'Space Mono',monospace;font-size:9px;color:#00e676;letter-spacing:2px;text-transform:uppercase;margin-top:3px;opacity:.7}

        .nv{display:flex;gap:8px;align-items:center}
        .nb{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;padding:7px 14px;
          border:1px solid #2a2a3a;background:transparent;cursor:pointer;transition:all .15s;
          color:#808090;text-transform:uppercase;letter-spacing:1.5px;white-space:nowrap}
        .nb:hover{border-color:#00e676;color:#00e676}
        .nb.on{border-color:#00e676;color:#00e676;background:#00e67610}

        .nb.rl{border-color:#00e676;color:#00e676;background:#00e67612}
        .nb.rl:hover{background:#00e67620;box-shadow:0 0 12px #00e67620}

        /* MAIN */
        .mn{padding:36px 24px 32px;max-width:960px;margin:0 auto}

        /* HERO */
        .hr{text-align:center;margin-bottom:40px}
        .hr-t{font-family:'Archivo Black',sans-serif;font-size:38px;color:#fff;text-transform:uppercase;letter-spacing:-1px;line-height:1.05}
        .hr-t .ak{font-family:'Permanent Marker',cursive;color:#ff1493;text-transform:none}
        .hr-sub{font-family:'Space Mono',monospace;font-size:11px;color:#606070;text-transform:uppercase;letter-spacing:3px;margin-top:12px}
        .hr-ct{display:inline-block;margin-top:18px;font-family:'Space Mono',monospace;font-size:11px;color:#00e676;letter-spacing:1px;border:1px solid #00e67630;padding:5px 16px;background:#00e67008}

        /* Thin accent line */
        .aln{height:1px;margin-bottom:32px;background:linear-gradient(90deg,transparent,#00e67640,#7c4dff40,transparent)}

        /* SECTION TITLES */
        .sx{font-family:'Space Mono',monospace;font-size:10px;color:#606070;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:12px}
        .sx::before{content:'//';color:#00e676;font-weight:700}
        .sx::after{content:'';flex:1;height:1px;background:#1a1a28}
        .sb{font-family:'Archivo Black',sans-serif;font-size:20px;color:#e0e0e8;text-transform:uppercase;letter-spacing:-.5px;margin-bottom:16px;display:flex;align-items:center;gap:12px}

        /* CATEGORIES */
        .cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:36px}
        .cc{background:#0d0d14;border:1px solid #1a1a28;padding:16px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
        .cc::before{content:'';position:absolute;top:0;left:0;width:2px;height:100%;background:var(--c);opacity:.5;transition:opacity .2s}
        .cc:hover{border-color:#2a2a3a;background:#111118}
        .cc:hover::before{opacity:1}
        .cc-l{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:16px;color:#e0e0e8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
        .cc-tg{font-family:'Space Mono',monospace;font-size:10px;color:#505060;letter-spacing:.5px}
        .cc-n{position:absolute;top:14px;right:14px;font-family:'Space Mono',monospace;font-size:11px;color:var(--c);opacity:.4}

        /* QUICK PICKS */
        .pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:36px}
        .pk{background:#0d0d14;border:1px solid #1a1a28;padding:12px 14px;cursor:pointer;transition:all .2s;border-left:2px solid var(--c)}
        .pk:hover{background:#111118;border-color:#2a2a3a;border-left-color:var(--c)}
        .pk-n{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:13px;color:#d0d0d8;text-transform:uppercase;letter-spacing:.5px}
        .pk-l{font-family:'Space Mono',monospace;font-size:10px;color:#505060;margin-top:2px}

        /* STREAM CARDS */
        .sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-bottom:36px}
        .sc{background:#0d0d14;border:1px solid #1a1a28;overflow:hidden;cursor:pointer;transition:all .2s}
        .sc:hover{border-color:#2a2a3a;transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,.4)}
        .sc-th{width:100%;aspect-ratio:16/9;background:#08080c;position:relative;overflow:hidden}
        .sc-th img{width:100%;height:100%;object-fit:cover;transition:transform .3s;opacity:.85}
        .sc:hover .sc-th img{transform:scale(1.03);opacity:1}
        .lv{position:absolute;top:8px;left:8px;background:#ff149390;color:#fff;font-family:'Space Mono',monospace;font-size:9px;padding:2px 8px;letter-spacing:2px;text-transform:uppercase;display:flex;align-items:center;gap:5px;backdrop-filter:blur(4px)}
        .lv-off{background:#33333390;color:#888}
        .ld{width:5px;height:5px;background:#fff;border-radius:50%;animation:bl 1.2s infinite}
        @keyframes bl{0%,100%{opacity:1}50%{opacity:.2}}
        .sc-dim{opacity:.45;filter:grayscale(.6)}
        .sc-i{padding:10px 12px}
        .sc-t{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;color:#d0d0d8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
        .sc-l{font-family:'Space Mono',monospace;font-size:10px;color:#505060}
        .vb{display:inline-block;font-family:'Space Mono',monospace;font-size:9px;padding:2px 8px;color:#0a0a0f;margin-top:5px;text-transform:uppercase;letter-spacing:1px;font-weight:700}

        /* BACK */
        .bk{font-family:'Space Mono',monospace;font-size:11px;padding:5px 12px;border:1px solid #2a2a3a;background:transparent;cursor:pointer;transition:all .15s;color:#606070;text-transform:uppercase;letter-spacing:1px}
        .bk:hover{border-color:#00e676;color:#00e676}

        /* PLAYER */
        .pw{padding:24px;max-width:960px;margin:0 auto}
        .pt{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
        .pf{width:100%;aspect-ratio:16/9;border:1px solid #1a1a28;overflow:hidden;background:#000;position:relative;
          box-shadow:0 0 30px rgba(0,0,0,.6)}
        .pf iframe{width:100%;height:100%;border:none}
        .pm{margin-top:14px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px}
        .pm-t{font-family:'Archivo Black',sans-serif;font-size:20px;color:#e0e0e8;text-transform:uppercase;letter-spacing:-.5px}
        .pm-l{font-family:'Space Mono',monospace;font-size:11px;color:#505060;margin-top:2px}
        .pa{display:flex;gap:6px;flex-wrap:wrap}
        .ab{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;padding:7px 14px;
          border:1px solid #2a2a3a;background:transparent;cursor:pointer;transition:all .15s;
          color:#808090;text-transform:uppercase;letter-spacing:1px}
        .ab:hover{border-color:#00e676;color:#00e676}
        .ab.fo{border-color:#ff1493;color:#ff1493;background:#ff149310}
        .ab.tv{border-color:#7c4dff;color:#7c4dff}
        .ab.tv:hover{background:#7c4dff15;box-shadow:0 0 10px #7c4dff20}

        /* GLOBE ROULETTE */
        .rou{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;padding:40px 24px;text-align:center}
        .rou-lb{font-family:'Space Mono',monospace;font-size:11px;color:#00e676;letter-spacing:4px;text-transform:uppercase;margin-bottom:32px;opacity:.7}

        .globe-wrap{position:relative;margin-bottom:24px}
        .globe-svg{filter:drop-shadow(0 0 20px #00e67615)}
        .globe-spin .globe-svg{animation:gspin .6s linear infinite}
        .globe-spin .globe-svg .lon-1{animation:lshift .3s linear infinite}
        .globe-spin .globe-svg .lon-2{animation:lshift .3s .15s linear infinite}
        .globe-spin .globe-svg .cont-1,.globe-spin .globe-svg .cont-2,.globe-spin .globe-svg .cont-3,.globe-spin .globe-svg .cont-4{animation:cflick .15s linear infinite alternate}
        @keyframes gspin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
        @keyframes lshift{0%{rx:30}50%{rx:10}100%{rx:30}}
        @keyframes cflick{0%{opacity:.15}100%{opacity:.05}}

        .globe-land .globe-svg{animation:gstop .8s ease-out forwards;filter:drop-shadow(0 0 30px #00e67630)}
        @keyframes gstop{0%{transform:rotateY(720deg)}100%{transform:rotateY(0)}}

        .globe-pin{position:absolute;top:30%;left:50%;transform:translate(-50%,-100%) scale(0);opacity:0;transition:all .4s cubic-bezier(.34,1.56,.64,1)}
        .pin-show{transform:translate(-50%,-100%) scale(1);opacity:1}

        .r-info{min-height:80px}
        .rc{font-family:'Space Mono',monospace;font-size:10px;color:#7c4dff;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;min-height:14px}
        .rn{font-family:'Archivo Black',sans-serif;font-size:22px;color:#e0e0e8;text-transform:uppercase;min-height:28px;letter-spacing:-.5px}
        .rlo{font-family:'Space Mono',monospace;font-size:11px;color:#505060;margin-top:4px;min-height:16px}
        .spb{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:14px;padding:10px 36px;
          border:1px solid #00e676;background:transparent;color:#00e676;cursor:pointer;transition:all .2s;
          margin-top:20px;text-transform:uppercase;letter-spacing:2px}
        .spb:hover:not(:disabled){background:#00e67615;box-shadow:0 0 20px #00e67620}
        .spb:disabled{opacity:.3;cursor:not-allowed}

        /* TV MODE */
        .tv{position:fixed;top:0;left:0;right:0;bottom:0;background:#000;z-index:100;display:flex;flex-direction:column}
        .tv-p{flex:1;position:relative}
        .tv-p iframe{width:100%;height:100%;border:none}
        .tv-c{position:absolute;bottom:0;left:0;right:0;padding:20px 24px;background:linear-gradient(transparent,rgba(0,0,0,.9));display:flex;justify-content:space-between;align-items:center;opacity:0;transition:opacity .3s}
        .tv:hover .tv-c{opacity:1}
        .tv-t{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:16px;text-transform:uppercase;color:#fff;letter-spacing:1px}
        .tv-l{font-family:'Space Mono',monospace;font-size:10px;color:rgba(255,255,255,.4)}
        .tv-bs{display:flex;gap:6px}
        .tvb{font-family:'Space Mono',monospace;font-size:10px;padding:6px 14px;border:1px solid rgba(255,255,255,.15);background:transparent;color:rgba(255,255,255,.7);cursor:pointer;transition:all .15s;text-transform:uppercase;letter-spacing:1px;backdrop-filter:blur(4px)}
        .tvb:hover{border-color:rgba(255,255,255,.4);color:#fff}
        .tvb.ex{border-color:#ff149360;color:#ff1493}
        .tvb.ex:hover{background:#ff149315}
        .tvb.ao{border-color:#00e67660;color:#00e676;background:#00e67610}

        /* FOOTER */
        .ft{text-align:center;padding:40px 24px;border-top:1px solid #1a1a28;font-family:'Space Mono',monospace;font-size:10px;color:#2a2a3a;letter-spacing:1px}
        .ft .br{font-family:'Archivo Black',sans-serif;color:#ff1493;text-transform:uppercase;font-size:11px}
        .ft .nt{font-size:9px;color:#1a1a28;margin-top:6px}

        .em{text-align:center;padding:60px 24px;color:#2a2a3a}
        .em-i{font-family:'Space Mono',monospace;font-size:36px;color:#1a1a28;margin-bottom:12px}

        @media(max-width:600px){
          .hd{flex-direction:column;gap:10px;align-items:flex-start;padding:12px 16px}
          .lg-w{font-size:20px}.lg-s{font-size:22px}
          .hr-t{font-size:28px}
          .cg{grid-template-columns:1fr 1fr;gap:6px}
          .sg{grid-template-columns:1fr}
          .nv{flex-wrap:wrap}
          .mn{padding:28px 16px}
          .pg{grid-template-columns:1fr 1fr}
        }
      `}</style>

      <div className="ws"><div className="z1">
        {view === "tv" && cur ? (
          <div className="tv">
            <div className="tv-p">
              <iframe src={`https://www.youtube.com/embed/${cur.videoId}?autoplay=1&mute=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen title={cur.title} />
              <div className="tv-c">
                <div><div className="tv-t">{cur.title}</div><div className="tv-l">{cur.location}</div></div>
                <div className="tv-bs">
                  <button className={`tvb ${tvAuto?'ao':''}`} onClick={()=>setTvAuto(!tvAuto)}>{tvAuto?"Auto ON":"Auto-rotate"}</button>
                  <button className="tvb" onClick={()=>rnd()}>Next</button>
                  <button className="tvb ex" onClick={()=>setView("player")}>Exit TV</button>
                </div>
              </div>
            </div>
          </div>
        ) : (<>
          <header className="hd">
            <div>
              <div className="lg" onClick={()=>{setView("home");setSelCat(null);setShowFavs(false)}}>
                <span className="lg-w">Window</span><span className="lg-s">Surf</span><span className="lg-tv">.TV</span>
              </div>
              <div className="tl">Turn any screen into somewhere else</div>
            </div>
            <nav className="nv">
              {favs.length>0&&<button className={`nb ${showFavs?'on':''}`} onClick={()=>{setShowFavs(!showFavs);setView("home");setSelCat(null)}}>Saved [{favs.length}]</button>}
              <button className="nb rl" onClick={spin}>Globe Spin</button>
            </nav>
          </header>

          {view==="roulette"&&(
            <div className="rou">
              <div className="rou-lb">Spinning the globe...</div>
              <Globe spinning={spinning} landed={landed} />
              <div className="r-info">
                <div className="rc">{rDisp?CATS.find(c=>c.id===rDisp.category)?.label||"":""}</div>
                <div className="rn">{rDisp?.title||""}</div>
                <div className="rlo">{rDisp?.location||""}</div>
              </div>
              <button className="spb" onClick={spin} disabled={spinning}>{spinning?"...":"Spin Again"}</button>
            </div>
          )}

          {view==="player"&&cur&&(
            <div className="pw">
              <div className="pt"><button className="bk" onClick={()=>{if(selCat)setView("category");else setView("home")}}>&larr; back</button></div>
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
                  <button className={`ab ${isF(cur)?'fo':''}`} onClick={()=>togFav(cur)}>{isF(cur)?"Saved":"Save"}</button>
                  <button className="ab" onClick={()=>rnd()}>Random</button>
                  <button className="ab tv" onClick={()=>setView("tv")}>TV Mode</button>
                </div>
              </div>
            </div>
          )}

          {view==="home"&&(
            <div className="mn">
              {!showFavs?(<>
                <div className="hr">
                  <div className="hr-t">Live windows <span className="ak">from around the world</span></div>
                  <div className="hr-sub">Curated live streams &mdash; leave one on &mdash; go somewhere else</div>
                  <div className="hr-ct">{streams.length} streams & counting</div>
                </div>
                <div className="aln"/>

                <div className="sx">Quick Picks</div>
                <div className="pg">
                  {[10,21,40,1,30,52].map(id=>streams.find(s=>s.id===id)).filter(Boolean).map(s=>(
                    <div key={s.id} className="pk" style={{"--c":CATS.find(c=>c.id===s.category)?.color}} onClick={()=>play(s)}>
                      <div className="pk-n">{s.title}</div>
                      <div className="pk-l">{s.location}</div>
                    </div>
                  ))}
                </div>

                <div className="sx">Categories</div>
                <div className="cg">
                  {CATS.map(cat=>(
                    <div key={cat.id} className="cc" style={{"--c":cat.color}} onClick={()=>{setSelCat(cat.id);setView("category")}}>
                      <div className="cc-l">{cat.label}</div>
                      <div className="cc-tg">{cat.tag}</div>
                      <div className="cc-n">{streams.filter(s=>s.category===cat.id).length}</div>
                    </div>
                  ))}
                </div>

                <div className="sx">All Streams</div>
                <div className="sg">{streams.map(s=><Card key={s.id} s={s}/>)}</div>
              </>):(<>
                <div className="sb"><button className="bk" onClick={()=>setShowFavs(false)}>&larr; back</button>Saved Streams</div>
                {favs.length===0?(<div className="em"><div className="em-i">[ ]</div><p>No saved streams yet.</p></div>):(
                  <div className="sg">{favs.map(s=><Card key={s.id} s={s}/>)}</div>
                )}
              </>)}
            </div>
          )}

          {view==="category"&&selCat&&(
            <div className="mn">
              <div className="sb"><button className="bk" onClick={()=>{setView("home");setSelCat(null)}}>&larr; back</button>{CATS.find(c=>c.id===selCat)?.label}</div>
              <div className="sg">{catS.map(s=><Card key={s.id} s={s}/>)}</div>
            </div>
          )}

          {(view==="home"||view==="category")&&(
            <footer className="ft"><span className="br">WindowSurf</span>.tv &mdash; curated live windows from around the world<div className="nt">Stream availability may vary.</div></footer>
          )}
        </>)}
      </div></div>
    </>
  );
}
