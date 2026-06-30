(function () {
  if (window._ttrsBot) { window._ttrsBot.stop(); return; }

  const VERSION = 'v2.1';

  const STATE = {
    answered: 0, streak: 0, bestStreak: 0,
    lastQ: '', answerAt: 0, lastNewQ: Date.now(),
    running: true, paused: false, speedMode: 'normal',
  };

  const SPEEDS   = { turbo:[180,400], normal:[480,920], human:[900,1800] };
  const STUCK_MS = { turbo:1000, normal:1800, human:3500 };
  const randDelay = () => { const [a,b]=SPEEDS[STATE.speedMode]; return a+Math.random()*(b-a); };

  // ── STYLES ──────────────────────────────────────────────
  const stel = document.createElement('style');
  stel.textContent = `
    #_ttrs*{box-sizing:border-box;font-family:'Courier New',monospace}
    #_ttrs{position:fixed;bottom:20px;right:20px;z-index:999999;width:224px;
      background:#050505;border:1px solid #ff2d78;border-radius:12px;
      box-shadow:0 0 28px rgba(255,45,120,.4),0 0 2px #ff2d78;
      overflow:hidden;font-size:11px;color:#fff;
      animation:_ttrsIn .35s cubic-bezier(.34,1.56,.64,1)}
    @keyframes _ttrsIn{from{transform:scale(.6) translateY(30px);opacity:0}to{transform:scale(1);opacity:1}}
    #_ttrsHdr{background:linear-gradient(90deg,#c2006e,#ff2d78);padding:8px 12px;
      display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none}
    #_ttrsHdr span{font-weight:900;font-size:12px;letter-spacing:1.5px;text-transform:uppercase}
    #_ttrsHdr small{font-size:9px;opacity:.75}
    #_ttrsClose{border:none;background:transparent;color:rgba(255,255,255,.7);cursor:pointer;font-size:15px;line-height:1;padding:0 2px}
    #_ttrsClose:hover{color:#fff}
    #_ttrsBody{padding:10px 12px}
    #_ttrsStatus{text-align:center;padding:5px;margin-bottom:8px;border-radius:6px;
      font-size:10px;font-weight:700;letter-spacing:1.2px;
      background:rgba(255,45,120,.1);border:1px solid rgba(255,45,120,.3);transition:all .2s}
    #_ttrsQ{text-align:center;font-size:15px;font-weight:900;color:#ffd54f;
      padding:6px 4px;margin-bottom:6px;min-height:30px;border-bottom:1px solid #1a1a1a}
    #_ttrsBar{height:3px;background:#111;border-radius:2px;margin-bottom:8px;overflow:hidden}
    #_ttrsBarFill{height:100%;width:0%;background:linear-gradient(90deg,#ff2d78,#ffd54f);border-radius:2px;transition:width .5s}
    .rx-row{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:7px}
    .rx-col{display:flex;flex-direction:column;align-items:center}
    .rx-label{color:#ff2d78;font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:2px}
    .rx-val{font-size:14px;font-weight:900}
    .green{color:#00ff88}.pink{color:#ff2d78}.yellow{color:#ffd54f}.grey{color:#888}
    .rx-btns{display:flex;gap:4px;margin-bottom:5px}
    .rx-btn{flex:1;border:1px solid #2a2a2a;background:#0d0d0d;color:#aaa;border-radius:6px;
      padding:5px 3px;font-size:10px;font-weight:700;cursor:pointer;transition:all .15s;
      text-align:center;font-family:'Courier New',monospace}
    .rx-btn:hover{border-color:#ff2d78;color:#ff2d78;background:rgba(255,45,120,.1)}
    .rx-btn.on{background:rgba(255,45,120,.18);border-color:#ff2d78;color:#ff2d78}
    .rx-btn.s-on{background:rgba(0,255,136,.12);border-color:#00ff88;color:#00ff88}
    .rx-foot{display:flex;justify-content:space-between;font-size:9px;color:#333;
      margin-top:4px;padding-top:4px;border-top:1px solid #111}
    .rx-kick-flash{animation:_ttrsKick .5s ease}
    @keyframes _ttrsKick{0%,100%{box-shadow:0 0 28px rgba(255,45,120,.4)}
      50%{box-shadow:0 0 50px rgba(255,213,79,.9);border-color:#ffd54f}}
  `;
  document.head.appendChild(stel);

  // ── HUD ─────────────────────────────────────────────────
  const hud = document.createElement('div');
  hud.id = '_ttrs';
  hud.innerHTML = `
    <div id="_ttrsHdr">
      <span>ttrs</span><small>${VERSION}</small>
      <button id="_ttrsClose">✕</button>
    </div>
    <div id="_ttrsBody">
      <div id="_ttrsStatus">● ON</div>
      <div id="_ttrsQ">waiting for question...</div>
      <div id="_ttrsBar"><div id="_ttrsBarFill"></div></div>
      <div class="rx-row">
        <div class="rx-col"><div class="rx-label">Done</div><div class="rx-val green" id="_rxAns">0</div></div>
        <div class="rx-col"><div class="rx-label">Streak</div><div class="rx-val yellow" id="_rxStreak">0</div></div>
        <div class="rx-col"><div class="rx-label">Best</div><div class="rx-val pink" id="_rxBest">0</div></div>
        <div class="rx-col"><div class="rx-label">Next</div><div class="rx-val grey" id="_rxNext">—</div></div>
      </div>
      <div class="rx-btns">
        <button class="rx-btn on" id="_rxPause">⏸ Pause</button>
        <button class="rx-btn" id="_rxKick">⚡ Kick</button>
        <button class="rx-btn" id="_rxSkip">⏭ Skip</button>
      </div>
      <div class="rx-btns">
        <button class="rx-btn" id="_rxTurbo">⚡ Turbo</button>
        <button class="rx-btn s-on" id="_rxNormal">▶ Normal</button>
        <button class="rx-btn" id="_rxHuman">🐢 Human</button>
      </div>
      <div class="rx-foot">
        <span id="_rxMode">normal</span><span>${VERSION} · silent ttrs bot</span>
      </div>
    </div>
  `;
  document.body.appendChild(hud);

  const $ = id => document.getElementById(id);
  let nextInTimer = null;

  function setStatus(txt, col) {
    const el = $('_ttrsStatus'); if (!el) return;
    el.textContent = '● ' + txt;
    el.style.color = col||'#fff';
    el.style.borderColor = (col||'#ff2d78')+'55';
    el.style.background  = (col||'#ff2d78')+'14';
  }

  function updateStats() {
    const a=$('_rxAns'),s=$('_rxStreak'),b=$('_rxBest');
    if(a) a.textContent=STATE.answered;
    if(s) s.textContent=STATE.streak;
    if(b) b.textContent=STATE.bestStreak;
    const pct=STATE.answered?Math.min(100,(STATE.streak/STATE.answered)*100):0;
    const f=$('_ttrsBarFill'); if(f) f.style.width=pct+'%';
  }

  function startCountdown(ms) {
    clearInterval(nextInTimer);
    const end=Date.now()+ms;
    nextInTimer=setInterval(()=>{
      const rem=Math.max(0,end-Date.now());
      const el=$('_rxNext'); if(el) el.textContent=rem>0?(rem/1000).toFixed(1)+'s':'—';
      if(rem<=0) clearInterval(nextInTimer);
    },80);
  }

  function setSpeedUI(mode) {
    ['_rxTurbo','_rxNormal','_rxHuman'].forEach(id=>{const b=$(id);if(b)b.className='rx-btn';});
    const map={turbo:'_rxTurbo',normal:'_rxNormal',human:'_rxHuman'};
    const btn=$(map[mode]); if(btn) btn.classList.add('s-on');
    const m=$('_rxMode'); if(m) m.textContent=mode;
  }

  // ── PARSE ────────────────────────────────────────────────
  function parse(txt) {
    txt=txt.replace(/Next:/i,'').trim();
    let m;
    if((m=txt.match(/(\d+)\s*[×x\*]\s*(\d+)/i))) return +m[1]*+m[2];
    if((m=txt.match(/(\d+)\s*[÷\/]\s*(\d+)/)))   return +m[2]?+m[1]/+m[2]:null;
    if((m=txt.match(/(\d+)\s*\+\s*(\d+)/)))       return +m[1]++m[2];
    if((m=txt.match(/(\d+)\s*[-−]\s*(\d+)/)))     return +m[1]-+m[2];
    return null;
  }

  // ── KEYS ─────────────────────────────────────────────────
  function pressKey(key,code,kc) {
    const o={key,code,keyCode:kc,which:kc,bubbles:true,cancelable:true};
    document.dispatchEvent(new KeyboardEvent('keydown',o));
    document.dispatchEvent(new KeyboardEvent('keypress',o));
    document.dispatchEvent(new KeyboardEvent('keyup',o));
  }

  function typeAnswer(answer) {
    for(let i=0;i<5;i++) pressKey('Backspace','Backspace',8);
    for(const d of String(Math.round(answer)).split(''))
      pressKey(d,'Digit'+d,48+(+d));
    pressKey('Enter','Enter',13);
  }

  // ── ANSWER ───────────────────────────────────────────────
  function tryAnswer(force) {
    if(!STATE.running||STATE.paused) return;
    if(!force&&Date.now()-STATE.answerAt<randDelay()) return;
    const qEl=document.querySelector('text.cls-main-30');
    if(!qEl) return;
    const qTxt=(qEl.textContent||'').trim();
    if(!qTxt||(!force&&qTxt===STATE.lastQ)) return;
    const answer=parse(qTxt);
    if(answer===null) return;

    STATE.lastQ=qTxt;
    STATE.answerAt=Date.now();
    STATE.lastNewQ=Date.now();

    const qd=$('_ttrsQ'); if(qd) qd.textContent=qTxt+' = '+Math.round(answer);
    const delay=randDelay();
    startCountdown(delay);
    setStatus('ON','#00ff88');

    setTimeout(()=>{
      if(!STATE.running) return;
      typeAnswer(answer);
      STATE.answered++;
      STATE.streak++;
      if(STATE.streak>STATE.bestStreak) STATE.bestStreak=STATE.streak;
      updateStats();
    }, Math.min(delay*0.55,250));
  }

  // ── KICK ─────────────────────────────────────────────────
  function kick() {
    hud.classList.add('rx-kick-flash');
    setTimeout(()=>hud.classList.remove('rx-kick-flash'),600);
    setStatus('KICK!','#ffd54f');
    STATE.lastQ=''; STATE.answerAt=0; STATE.lastNewQ=Date.now();
    tryAnswer(true);
    setTimeout(()=>setStatus(STATE.paused?'PAUSED':'ON',STATE.paused?'#888':'#00ff88'),700);
  }

  // ── WATCHDOG ─────────────────────────────────────────────
  const watchdog=setInterval(()=>{
    if(!STATE.running||STATE.paused) return;
    if(Date.now()-STATE.lastNewQ>STUCK_MS[STATE.speedMode]) kick();
  },250);

  const obs=new MutationObserver(()=>tryAnswer());
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  const poll=setInterval(()=>{if(STATE.running)tryAnswer();},40);

  updateStats();
  setSpeedUI('normal');
  tryAnswer(true);

  // ── BUTTONS ──────────────────────────────────────────────
  $('_rxPause').onclick=()=>{
    STATE.paused=!STATE.paused;
    $('_rxPause').textContent=STATE.paused?'▶ Resume':'⏸ Pause';
    $('_rxPause').classList.toggle('on',!STATE.paused);
    setStatus(STATE.paused?'PAUSED':'ON',STATE.paused?'#888':'#00ff88');
    if(!STATE.paused){STATE.lastNewQ=Date.now();tryAnswer();}
  };
  $('_rxKick').onclick=kick;
  $('_rxSkip').onclick=()=>{
    STATE.lastQ=''; STATE.answerAt=0; STATE.streak=0;
    updateStats(); tryAnswer(true);
    setStatus('SKIPPED','#ff9800');
    setTimeout(()=>setStatus('ON','#00ff88'),800);
  };
  $('_rxTurbo').onclick =()=>{STATE.speedMode='turbo'; setSpeedUI('turbo'); STATE.lastNewQ=Date.now();};
  $('_rxNormal').onclick=()=>{STATE.speedMode='normal';setSpeedUI('normal');STATE.lastNewQ=Date.now();};
  $('_rxHuman').onclick =()=>{STATE.speedMode='human'; setSpeedUI('human'); STATE.lastNewQ=Date.now();};
  $('_ttrsClose').onclick=stop;

  // ── DRAG ─────────────────────────────────────────────────
  let drag=false,ox=0,oy=0;
  $('_ttrsHdr').onmousedown=e=>{
    if(e.target.id==='_ttrsClose') return;
    drag=true;
    const r=hud.getBoundingClientRect();
    hud.style.right='auto';hud.style.bottom='auto';
    hud.style.left=r.left+'px';hud.style.top=r.top+'px';
    ox=e.clientX-r.left;oy=e.clientY-r.top;
  };
  document.addEventListener('mouseup',()=>drag=false);
  document.addEventListener('mousemove',e=>{
    if(!drag) return;
    hud.style.left=(e.clientX-ox)+'px';
    hud.style.top=(e.clientY-oy)+'px';
  });

  // ── STOP ─────────────────────────────────────────────────
  function stop() {
    STATE.running=false;
    obs.disconnect();
    clearInterval(poll);
    clearInterval(watchdog);
    clearInterval(nextInTimer);
    stel.remove();
    hud.remove();
    delete window._ttrsBot;
  }

  window._ttrsBot={stop,kick,parse,typeAnswer,STATE};
})();
