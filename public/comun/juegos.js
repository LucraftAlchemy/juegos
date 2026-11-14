/* Juegos de Lucas — utilidades compartidas por memorama/ y laberinto/:
   lista de Pokémon, sonido (cries, voz y efectos), progreso, récords, código de guardado y ventanas.
   Todo se guarda en este navegador (localStorage "lucraft.juegos"). El código de guardado lleva
   los Pokémon liberados y las medallas para pasarlos a otro dispositivo; los récords se quedan aquí. */
(function(){
"use strict";

const ART = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const CRY = id => `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

/* Los 15 Pokémon favoritos de Lucas */
const MONS = [
  {id:25,  n:"Pikachu",    t:["electric"]},
  {id:4,   n:"Charmander", t:["fire"]},
  {id:7,   n:"Squirtle",   t:["water"]},
  {id:1,   n:"Bulbasaur",  t:["grass","poison"]},
  {id:133, n:"Eevee",      t:["normal"]},
  {id:150, n:"Mewtwo",     t:["psychic"]},
  {id:448, n:"Lucario",    t:["fighting","steel"]},
  {id:94,  n:"Gengar",     t:["ghost","poison"]},
  {id:131, n:"Lapras",     t:["water","ice"]},
  {id:384, n:"Rayquaza",   t:["dragon","flying"]},
  {id:906, n:"Sprigatito", t:["grass"]},
  {id:658, n:"Greninja",   t:["water","dark"]},
  {id:700, n:"Sylveon",    t:["fairy"]},
  {id:778, n:"Mimikyu",    t:["ghost","fairy"]},
  {id:197, n:"Umbreon",    t:["dark"]},
];
const BY = Object.fromEntries(MONS.map(m => [m.id, m]));
/* tipo: [nombre, color, ícono, claro, oscuro] */
const TIPOS = {
  normal:["Normal","#A8A77A","⭐","#F3F0DC","#7E7B55"], fire:["Fuego","#EE8130","🔥","#FFD6AE","#C9471A"],
  water:["Agua","#6390F0","💧","#C7DBFF","#3159B8"], grass:["Planta","#7AC74C","🌿","#D9F7BF","#3F8A24"],
  electric:["Eléctrico","#F7D02C","⚡","#FFF4AE","#D99A00"], ice:["Hielo","#96D9D6","❄️","#DDF6F5","#4FA8A4"],
  fighting:["Lucha","#C22E28","🥊","#F7C4B8","#8E1B17"], poison:["Veneno","#A33EA1","🧪","#ECC6EB","#73246F"],
  flying:["Volador","#A98FF3","🪶","#E6DDFF","#6D55C4"], psychic:["Psíquico","#F95587","🔮","#FFD3E2","#C72D61"],
  ghost:["Fantasma","#735797","👻","#DCCDF2","#47326A"], dragon:["Dragón","#6F35FC","🐉","#D6C6FF","#4318B8"],
  dark:["Siniestro","#705746","🌙","#D9CBC0","#3A2A20"], steel:["Acero","#B7B7CE","⚙️","#EDEDF5","#7A7A96"],
  fairy:["Hada","#D685AD","✨","#FFDDEE","#B05486"],
};
/* Orden en que se liberan en el laberinto (Pikachu viene desde el inicio) */
const ORDEN = [25,133,4,7,1,906,131,94,197,700,778,448,658,384,150];
const MEDALLAS = ["", "bronce", "plata", "oro"];
const NLAB = 15, NMEM = 3;

/* ---------- Guardado ---------- */
const KEY = "lucraft.juegos";
function fresh(){ return {v:1, libres:0, lab:Array(NLAB).fill(0), mem:Array(NMEM).fill(0), rec:{}, nombres:[], pref:{}, sonido:true}; }
function fix(d){
  const f = fresh();
  for(const k in f) if(d[k] === undefined || d[k] === null) d[k] = f[k];
  d.libres = Math.max(0, Math.min(ORDEN.length - 1, d.libres|0));
  d.lab = Array.from({length:NLAB}, (_,i) => Math.max(0, Math.min(3, (d.lab[i]|0))));
  d.mem = Array.from({length:NMEM}, (_,i) => Math.max(0, Math.min(3, (d.mem[i]|0))));
  if(!Array.isArray(d.nombres)) d.nombres = [];
  return d;
}
function load(){ try{ const d = JSON.parse(localStorage.getItem(KEY)); if(d && d.v === 1) return fix(d); }catch(e){} return fresh(); }
let D = load();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(D)); }catch(e){} }
function pref(k, v){ if(v === undefined) return D.pref[k]; D.pref[k] = v; save(); return v; }

/* ---------- Sonido ---------- */
let ac = null;
function actx(){
  if(!ac){ const C = window.AudioContext || window.webkitAudioContext; if(!C) return null; try{ ac = new C(); }catch(e){ return null; } }
  if(ac.state === "suspended") ac.resume();
  return ac;
}
function tone(f, t0, d, type="triangle", v=.12){
  const c = actx(); if(!c || !D.sonido) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + d);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
}
function slide(f1, f2, t0, d, type="sine", v=.1){
  const c = actx(); if(!c || !D.sonido) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + d);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
}
const cryEl = new Audio(); cryEl.preload = "auto";
function cry(id, vol=.55){
  return new Promise(res => {
    let done = false; const fin = () => { if(!done){ done = true; res(); } };
    if(!D.sonido || !id) return fin();
    try{
      cryEl.pause(); cryEl.src = CRY(id); cryEl.volume = vol;
      cryEl.onended = fin; cryEl.onerror = fin;
      const p = cryEl.play(); if(p && p.catch) p.catch(fin);
    }catch(e){ fin(); }
    setTimeout(fin, 2600);
  });
}
let voz = null;
function pickVoice(){
  if(!("speechSynthesis" in window)) return null;
  const vs = speechSynthesis.getVoices();
  return vs.find(v => /es[-_]MX/i.test(v.lang)) || vs.find(v => /es[-_](US|419)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null;
}
let sayN = 0;
function speak(text){
  const n = ++sayN;
  return new Promise(res => {
    let done = false; const fin = () => { if(!done){ done = true; res(); } };
    if(!D.sonido || !("speechSynthesis" in window)) return setTimeout(fin, 500 + text.length*30);
    try{
      speechSynthesis.cancel();
      if(!voz) voz = pickVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voz; u.lang = voz ? voz.lang : "es-MX"; u.rate = .97;
      u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
    }catch(e){ fin(); }
    setTimeout(fin, 1800 + text.length*80);
  });
}
function hush(){ sayN++; try{ cryEl.pause(); }catch(e){} try{ if("speechSynthesis" in window) speechSynthesis.cancel(); }catch(e){} }
if("speechSynthesis" in window){ try{ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => { voz = pickVoice(); }; }catch(e){} }
/* Efectos cortos */
const sfx = {
  tap(){ tone(720,0,.07,"triangle",.08); },
  flip(){ slide(500,900,0,.09,"triangle",.07); },
  ok(){ [659,784,1047].forEach((f,i) => tone(f, i*.07, .18)); },
  combo(n){ [659,784,988,1175,1319].slice(0, Math.min(5, 2+n)).forEach((f,i) => tone(f, i*.06, .16)); },
  no(){ tone(300,0,.16,"sine",.08); tone(250,.09,.18,"sine",.07); },
  coin(){ tone(988,0,.08,"square",.05); tone(1319,.07,.2,"square",.05); },
  key(){ [880,1175,1568,2093].forEach((f,i) => tone(f, i*.06, .22, "triangle", .08)); },
  door(){ tone(160,0,.12,"square",.05); tone(120,.08,.14,"square",.04); [784,988,1319].forEach((f,i) => tone(f,.22+i*.08,.25)); },
  bump(){ slide(220,140,0,.12,"sine",.08); },
  win(){ [523,659,784,1047,784,1047,1319].forEach((f,i) => tone(f, i*.11, .28)); },
  free(){ [392,523,659,784,1047,1319,1568].forEach((f,i) => tone(f, i*.08, .3, "triangle", .1)); },
};
function soundButton(btn){
  const paint = () => { btn.textContent = D.sonido ? "🔊" : "🔇"; btn.setAttribute("aria-pressed", String(!D.sonido)); btn.setAttribute("aria-label", D.sonido ? "Quitar sonido" : "Poner sonido"); };
  btn.addEventListener("click", () => { D.sonido = !D.sonido; save(); if(!D.sonido) hush(); else actx(); paint(); });
  paint();
}

/* ---------- Progreso: Pokémon liberados y medallas ---------- */
const libres = () => ORDEN.slice(0, 1 + D.libres);
const isLibre = id => libres().includes(id);
const siguiente = () => D.libres < ORDEN.length - 1 ? ORDEN[D.libres + 1] : null;
function liberar(){ const id = siguiente(); if(id){ D.libres++; save(); } return id; }
/* juego: "lab" (aventura del laberinto) o "mem" (memorama). Guarda la mejor medalla y regresa la anterior. */
function medalla(juego, i, m){
  if(m === undefined) return D[juego][i] || 0;
  const prev = D[juego][i] || 0;
  if(m > prev){ D[juego][i] = m; save(); }
  return prev;
}

/* ---------- Código de guardado: 10 letras/números, por ejemplo 8K2MQ-7XWTR ----------
   45 bits (versión, liberados, 15 medallas del laberinto, 3 del memorama) + 1 carácter de verificación.
   Alfabeto sin letras que se confunden (sin I, L, O, U). */
const ABC = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function codigo(){
  const bits = [];
  const put = (v, n) => { for(let i=n-1; i>=0; i--) bits.push((v >> i) & 1); };
  put(1,2); put(D.libres,4); D.lab.forEach(m => put(m,2)); D.mem.forEach(m => put(m,2)); put(0,3);
  const vals = [];
  for(let i=0; i<45; i+=5){ let v = 0; for(let j=0; j<5; j++) v = v*2 + bits[i+j]; vals.push(v); }
  let s = 0; vals.forEach((v,k) => s += (2*k+1)*v); vals.push(s % 32);
  const str = vals.map(v => ABC[v]).join("");
  return str.slice(0,5) + "-" + str.slice(5);
}
function leerCodigo(txt){
  const c = String(txt||"").toUpperCase().replace(/[^0-9A-Z]/g,"").replace(/O/g,"0").replace(/[IL]/g,"1").replace(/U/g,"V");
  if(c.length !== 10) return null;
  const vals = [...c].map(ch => ABC.indexOf(ch)); if(vals.includes(-1)) return null;
  let s = 0; for(let k=0; k<9; k++) s += (2*k+1)*vals[k];
  if(s % 32 !== vals[9]) return null;
  const bits = []; for(let k=0; k<9; k++) for(let j=4; j>=0; j--) bits.push((vals[k] >> j) & 1);
  let p = 0; const get = n => { let v = 0; for(let i=0; i<n; i++) v = v*2 + bits[p++]; return v; };
  if(get(2) !== 1) return null;
  const lib = get(4); if(lib > ORDEN.length - 1) return null;
  const lab = Array.from({length:NLAB}, () => get(2)), mem = Array.from({length:NMEM}, () => get(2));
  return {libres:lib, lab, mem};
}
/* Combina con lo que ya hay (se queda con lo mejor de los dos), así nunca se pierde progreso. */
function aplicarCodigo(txt){
  const c = leerCodigo(txt); if(!c) return false;
  D.libres = Math.max(D.libres, c.libres);
  D.lab = D.lab.map((m,i) => Math.max(m, c.lab[i]));
  D.mem = D.mem.map((m,i) => Math.max(m, c.mem[i]));
  save(); return true;
}

/* ---------- Récords (top 10 por pestaña, en este dispositivo) ---------- */
const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const limpiaNombre = s => String(s||"").replace(/[^\p{L}\p{N} ]/gu,"").replace(/\s+/g," ").trim().slice(0,12);
const hoy = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };
const fmt = n => Number(n).toLocaleString("es-MX");
function recordarNombre(n){ D.nombres = [n, ...D.nombres.filter(x => x.toLowerCase() !== n.toLowerCase())].slice(0,6); save(); }
function todos(juego){ const r = D.rec[juego] || {}; return Object.values(r).flat().sort((a,b) => b.p - a.p).slice(0,10); }
function agregarRecord(juego, tab, r){
  r = {...r, n: limpiaNombre(r.n), d: hoy(), k: Date.now()};
  const rec = D.rec[juego] || (D.rec[juego] = {});
  const list = rec[tab] || (rec[tab] = []);
  list.push(r); list.sort((a,b) => b.p - a.p || a.k - b.k);
  const pos = list.indexOf(r) + 1;
  if(list.length > 10) list.length = 10;
  recordarNombre(r.n); save();
  const ti = todos(juego).findIndex(x => x.k === r.k) + 1;
  return {pos: pos <= 10 ? pos : 0, todos: ti};
}

/* ---------- Ventanas, avisos, medallas y confeti ---------- */
function modal(html, cls=""){
  const ov = document.createElement("div");
  ov.className = "jmodal " + cls;
  ov.innerHTML = `<div class="jsheet" role="dialog" aria-modal="true"><button class="jclose" type="button" aria-label="Cerrar">✕</button>${html}</div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("on"));
  let closed = false, onClose = null;
  const close = () => {
    if(closed) return; closed = true;
    ov.classList.remove("on"); document.removeEventListener("keydown", key);
    setTimeout(() => ov.remove(), 220); if(onClose) onClose();
  };
  const key = e => { if(e.key === "Escape") close(); };
  ov.addEventListener("click", e => { if(e.target === ov || e.target.closest(".jclose")) close(); });
  document.addEventListener("keydown", key);
  return {el: ov.querySelector(".jsheet"), close, set onClose(f){ onClose = f; }};
}
let toastT = 0;
function toast(msg, ms=2400){
  let t = document.querySelector(".jtoast");
  if(!t){ t = document.createElement("div"); t.className = "jtoast"; t.setAttribute("role","status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), ms);
}
function medallaSVG(m, size=90){
  const C = {3:["#FFE58A","#F2B705","#A87400"], 2:["#F7F9FC","#C5CEDA","#76818F"], 1:["#F8CDA6","#D9894A","#94501D"], 0:["#F2EFF7","#DCD6E8","#B7AFC8"]}[m||0];
  return `<svg class="jmed" viewBox="0 0 100 122" width="${size}" height="${Math.round(size*1.22)}" aria-hidden="true">
    <path d="M28 0h17l11 34H39z" fill="${m?"#E1262D":"#D9D2E6"}"/><path d="M55 0h17L61 34H44z" fill="${m?"#2F7BE5":"#CFC7DF"}"/>
    <circle cx="50" cy="76" r="41" fill="${C[1]}" stroke="${C[2]}" stroke-width="4"/>
    <circle cx="50" cy="76" r="31" fill="${C[0]}" stroke="${C[2]}" stroke-width="2" stroke-dasharray="3.5 3.5"/>
    <path d="M50 54l6.6 13.4 14.8 2.1-10.7 10.4 2.5 14.7L50 87.7l-13.2 6.9 2.5-14.7-10.7-10.4 14.8-2.1z" fill="${C[1]}" stroke="${C[2]}" stroke-width="2.2" stroke-linejoin="round"/>
    <ellipse cx="37" cy="58" rx="11" ry="5" fill="#fff" opacity=".55" transform="rotate(-32 37 58)"/></svg>`;
}
function confeti(host, n=70){
  host = host || document.body;
  const box = document.createElement("div"); box.className = "jconf"; box.setAttribute("aria-hidden","true");
  const cols = ["#E1262D","#F2B705","#2F7BE5","#2E9E4F","#B79CF0","#FF7AB6","#35C6E8"];
  for(let i=0; i<n; i++){
    const s = document.createElement("i");
    s.style.left = (Math.random()*100) + "%";
    s.style.background = cols[i % cols.length];
    s.style.animationDuration = (2.2 + Math.random()*1.8) + "s";
    s.style.animationDelay = (Math.random()*.6) + "s";
    s.style.setProperty("--dx", (Math.random()*160 - 80) + "px");
    s.style.setProperty("--r", (Math.random()*720 - 360) + "deg");
    if(i % 3 === 0) s.style.borderRadius = "50%";
    box.appendChild(s);
  }
  host.appendChild(box); setTimeout(() => box.remove(), 4800);
}

/* Récords: ventana con pestañas. tabs = [[clave, "Etiqueta"], ...] */
function verRecords(juego, titulo, tabs){
  const all = [["todos","Todos"], ...tabs];
  const m = modal(`<h2 class="jh">🏆 Récords</h2><p class="jsub">${esc(titulo)}</p>
    <div class="jtabs" role="tablist">${all.map(([k,l],i) => `<button type="button" role="tab" data-k="${k}" aria-selected="${i===0}">${esc(l)}</button>`).join("")}</div>
    <ol class="jrec"></ol>`, "rec");
  const ol = m.el.querySelector(".jrec");
  const paint = k => {
    for(const b of m.el.querySelectorAll(".jtabs button")) b.setAttribute("aria-selected", String(b.dataset.k === k));
    const list = k === "todos" ? todos(juego) : ((D.rec[juego]||{})[k] || []);
    if(!list.length){ ol.innerHTML = `<li class="empty">Todavía no hay récords aquí.<br>¡Juega y pon tu nombre! 🎮</li>`; return; }
    ol.innerHTML = list.map((r,i) => `<li class="${i<3?"top":""}">
      <span class="pos">${["🥇","🥈","🥉"][i] || (i+1)}</span>
      ${r.mon ? `<img src="${ART(r.mon)}" alt="" loading="lazy">` : ""}
      <span class="who"><b>${esc(r.n)}</b><small>${esc(r.l||"")} · ${esc(r.d||"")}</small></span>
      <span class="md">${r.m ? medallaSVG(r.m, 24) : ""}</span>
      <span class="pts">${fmt(r.p)}</span></li>`).join("");
  };
  m.el.querySelector(".jtabs").addEventListener("click", e => { const b = e.target.closest("button[data-k]"); if(b){ sfx.tap(); paint(b.dataset.k); } });
  paint("todos");
  return m;
}

/* Código de guardado: mostrar, copiar y cargar */
function verCodigo(onLoad){
  const m = modal(`<h2 class="jh">💾 Código de guardado</h2>
    <p class="jsub">Con este código tus Pokémon liberados y tus medallas pasan a otro celular, tablet o computadora.</p>
    <div class="jcode" aria-label="Tu código">${codigo()}</div>
    <div class="jrow"><button class="jbtn blue" type="button" data-a="copy">📋 Copiar</button></div>
    <hr class="jhr">
    <label class="jlab" for="jcodeIn">¿Tienes un código de otro dispositivo?</label>
    <form class="jform" autocomplete="off"><input id="jcodeIn" maxlength="14" placeholder="XXXXX-XXXXX" autocapitalize="characters" spellcheck="false" enterkeyhint="go">
    <button class="jbtn ok" type="submit">Cargar</button></form>
    <p class="jmsg" role="status"></p>`, "code");
  const msg = m.el.querySelector(".jmsg");
  m.el.querySelector('[data-a="copy"]').onclick = async () => {
    const c = codigo();
    try{ await navigator.clipboard.writeText(c); msg.textContent = "¡Copiado! Pégalo donde quieras guardarlo."; }
    catch(e){ msg.textContent = "Anótalo en un papel: " + c; }
  };
  m.el.querySelector(".jform").onsubmit = e => {
    e.preventDefault();
    const inp = m.el.querySelector("#jcodeIn");
    if(aplicarCodigo(inp.value)){
      sfx.ok(); msg.className = "jmsg good"; msg.textContent = "¡Listo! Se cargó tu progreso. ✨";
      m.el.querySelector(".jcode").textContent = codigo(); inp.value = "";
      if(onLoad) onLoad();
    }else{
      sfx.no(); msg.className = "jmsg bad"; msg.textContent = "Ese código no funciona. Revisa las letras y los números.";
    }
  };
  return m;
}

/* "¿Quién jugó?": elige o escribe un nombre y guarda el récord. info = {p, l, m, mon} */
function pedirNombre(box, juego, tab, info, onSaved){
  const names = D.nombres;
  box.innerHTML = `<p class="jask">¿Quién jugó? Toca tu nombre para guardar tus puntos 🏆</p>
    <div class="jchips">${names.map(n => `<button type="button" class="jchip" data-n="${esc(n)}">${esc(n)}</button>`).join("")}
    <button type="button" class="jchip new">✏️ ${names.length ? "Otro nombre" : "Escribe tu nombre"}</button></div>
    <form class="jform jnew" hidden autocomplete="off"><input maxlength="12" placeholder="Tu nombre" enterkeyhint="done" aria-label="Tu nombre"><button class="jbtn ok" type="submit">Guardar</button></form>`;
  const form = box.querySelector(".jnew"), inp = form.querySelector("input");
  const done = name => {
    name = limpiaNombre(name); if(!name){ inp.focus(); return; }
    const r = agregarRecord(juego, tab, {...info, n:name});
    const place = r.todos || r.pos;
    const txt = place === 1 ? "🥇 ¡Primer lugar!" : place ? `¡Lugar ${place} en los récords!` : "¡Buen juego!";
    box.innerHTML = `<p class="jsaved"><b>${esc(name)}</b> · ${txt}</p><button type="button" class="jbtn purple small" data-a="rec">🏆 Ver récords</button>`;
    sfx.ok();
    speak(place === 1 ? `¡${name} va en primer lugar!` : place ? `¡${name}, lugar ${place}!` : `¡Muy bien, ${name}!`);
    if(onSaved) onSaved(r);
  };
  box.querySelector(".jchips").addEventListener("click", e => {
    const b = e.target.closest(".jchip"); if(!b) return;
    if(b.classList.contains("new")){ form.hidden = false; b.hidden = true; inp.focus(); return; }
    done(b.dataset.n);
  });
  form.onsubmit = e => { e.preventDefault(); done(inp.value); };
}

/* Inclinación con el giroscopio (iPad / celular). Llama cb(dx, dy) con valores de -1 a 1. */
const gyro = {
  on:false, cb:null, base:null,
  supported(){ return "DeviceOrientationEvent" in window && matchMedia("(hover: none)").matches; },
  async start(cb){
    this.cb = cb; this.base = null;
    try{
      if(typeof DeviceOrientationEvent.requestPermission === "function"){
        const r = await DeviceOrientationEvent.requestPermission(); if(r !== "granted") return false;
      }
    }catch(e){ return false; }
    if(!this.on){ window.addEventListener("deviceorientation", this.h); this.on = true; }
    return true;
  },
  stop(){ window.removeEventListener("deviceorientation", this.h); this.on = false; },
  h(e){
    const g = gyro; if(e.beta == null || !g.cb) return;
    if(!g.base) g.base = {b:e.beta, g:e.gamma};
    g.base.b += (e.beta - g.base.b) * .01; g.base.g += (e.gamma - g.base.g) * .01;   // se va centrando solo
    let dx = Math.max(-1, Math.min(1, (e.gamma - g.base.g) / 18)), dy = Math.max(-1, Math.min(1, (e.beta - g.base.b) / 18));
    const a = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    if(a === 90) [dx, dy] = [dy, -dx]; else if(a === -90 || a === 270) [dx, dy] = [-dy, dx]; else if(a === 180){ dx = -dx; dy = -dy; }
    g.cb(dx, dy);
  }
};

/* Desbloquea el audio en iPad con el primer toque */
function unlock(){ actx(); try{ if("speechSynthesis" in window && !unlock.done){ const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); unlock.done = true; } }catch(e){} }
document.addEventListener("pointerdown", unlock, {once:true, capture:true});
document.addEventListener("keydown", unlock, {once:true, capture:true});
/* Si una imagen no carga (sin internet), que no se vea el ícono roto */
document.addEventListener("error", e => { const t = e.target; if(t && t.tagName === "IMG") t.classList.add("broken"); }, true);

window.J = {
  ART, CRY, MONS, BY, TIPOS, ORDEN, MEDALLAS,
  get data(){ return D; }, save, pref,
  actx, tone, slide, cry, speak, hush, sfx, soundButton, get sonido(){ return D.sonido; },
  libres, isLibre, siguiente, liberar, medalla,
  codigo, leerCodigo, aplicarCodigo,
  agregarRecord, todos, verRecords, verCodigo, pedirNombre,
  modal, toast, medallaSVG, confeti, esc, fmt, gyro,
};
})();
