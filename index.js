const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const menuCmd = require('./commands/menu');
const infoCmd = require('./commands/info');

const app = express();
app.use(express.json());
let sock = null;

function withChannel(text) {
  return `${text}\n\n*📢 JOIN CHANNEL:*\n*${config.channelName}*\n${config.channel}\n_${config.footer}_`;
}

// ===== PAJ PAIRING BEL DESIGN + PING =====
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>BLAST X ENGINE - Get Pairing Code</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
  body{background:#050507;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  .card{width:100%;max-width:440px;padding:32px 28px;border-radius:34px;background:linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.04) 45%, rgba(255,255,255,.09));backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,.25);box-shadow:0 30px 70px rgba(0,0,0,.6);text-align:center}
  .logo{width:64px;height:64px;margin:0 auto 14px;border-radius:20px;background:linear-gradient(145deg, rgba(255,255,255,.3), rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center}
  h1{font-size:26px;font-weight:900}
  .owner{color:#b8b8c2;font-size:13px;letter-spacing:2px;margin-top:4px}
  .ping-box{display:flex;justify-content:space-between;gap:10px;margin:20px 0}
  .ping-item{flex:1;padding:12px 8px;border-radius:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}
  .ping-item b{font-size:15px;display:block}
  .ping-item span{font-size:11px;color:#aaa;letter-spacing:1px}
  .dot{width:10px;height:10px;background:#00ff88;border-radius:50%;display:inline-block;box-shadow:0 0 12px #00ff88}
  label{display:block;text-align:left;font-size:13px;color:#c8c8d0;margin:14px 0 8px}
  .input-wrap{position:relative}
  .input-wrap span{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:#888}
  input{width:100%;padding:16px 16px 16px 48px;border-radius:16px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.35);color:#fff;font-size:17px;outline:none}
  .btn{width:100%;margin-top:18px;padding:17px;border-radius:100px;background:#fff;color:#000;font-weight:900;font-size:16px;border:none;cursor:pointer}
  .code-box{margin-top:22px;padding:20px;border-radius:20px;background:rgba(0,0,0,.4);border:1px dashed rgba(255,255,255,.35);display:none}
  .code-box.show{display:block}
  #code{font-size:36px;font-weight:900;letter-spacing:10px;margin:8px 0}
  .copy-btn{padding:10px 20px;border-radius:100px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);color:#fff;cursor:pointer;font-weight:700;margin-top:8px}
  .steps{text-align:left;margin-top:20px;padding:16px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-size:13px;line-height:1.8;color:#b8b8c2}
  .channel{margin-top:18px;padding:14px;border-radius:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);font-size:13px}
  .channel a{color:#fff;font-weight:700;word-break:break-all}
  .footer{margin-top:16px;font-size:11px;color:#777}
  #status{font-size:13px;margin-top:10px;color:#ffb3b3;min-height:18px}
</style></head><body>
  <div class="card">
    <div class="logo"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></div>
    <h1>BLAST X ENGINE</h1>
    <p class="owner">BY BLAST TECHNOLOGY</p>
    <div class="ping-box">
      <div class="ping-item"><b><span class="dot"></span> ONLINE</b><span>STATUS</span></div>
      <div class="ping-item"><b id="ping">-- ms</b><span>PING</span></div>
      <div class="ping-item"><b>24/7</b><span>UPTIME</span></div>
    </div>
    <label>ENTER YOUR WHATSAPP NUMBER</label>
    <div class="input-wrap"><span>+</span><input id="num" type="tel" placeholder="509 3494 6793" /></div>
    <button class="btn" id="btn" onclick="getCode()">GET PAIRING CODE</button>
    <p id="status"></p>
    <div class="code-box" id="codeBox"><span style="font-size:11px;letter-spacing:2px;color:#aaa">YOUR PAIRING CODE</span><div id="code">--------</div><button class="copy-btn" onclick="copyCode()">Copy Code</button><p style="font-size:12px;color:#aaa;margin-top:10px">Code expires in 60 seconds</p></div>
    <div class="steps"><b>HOW TO CONNECT:</b><br>1. Copy your code above<br>2. Open WhatsApp > Settings > Linked Devices<br>3. Tap <b>Link with phone number</b><br>4. Paste your code — Done!</div>
    <div class="channel"><b>JOIN OUR CHANNEL - BLAST TEAM !</b><br><a href="${config.channel}">${config.channel}</a></div>
    <p class="footer">© 2026 BLAST TECHNOLOGY • ALL RIGHTS RESERVED</p>
  </div>
<script>
  async function checkPing(){ let start = Date.now(); try{ await fetch('/ping'); document.getElementById('ping').innerText = (Date.now()-start)+' ms'; }catch(e){ document.getElementById('ping').innerText='OFFLINE'; } }
  checkPing(); setInterval(checkPing, 5000);
  async function getCode(){
    let num = document.getElementById('num').value.replace(/[^0-9]/g,'');
    let status = document.getElementById('status'); let btn = document.getElementById('btn');
    if(num.length < 10){ status.innerText='Please enter a valid number. Ex: 50934946793'; return; }
    btn.disabled=true; btn.innerText='GENERATING...'; status.innerText='';
    try{ let r = await fetch('/pair?number='+num); let d = await r.json();
      if(d.code){ document.getElementById('codeBox').classList.add('show'); document.getElementById('code').innerText=d.code; status.style.color='#7dffb0'; status.innerText='Code generated! Copy it fast.'; }
      else{ status.innerText=d.error||'Failed. Try again.'; }
    }catch(e){ status.innerText='Error. Bot is offline. Try again.'; }
    btn.disabled=false; btn.innerText='GET PAIRING CODE';
  }
  function copyCode(){ let c=document.getElementById('code').innerText; navigator.clipboard.writeText(c); alert('Code copied: '+c); }
</script></body></html>
  `);
});

app.get('/ping', (req, res) => { res.json({ status: 'online', ping: Date.now(), bot: config.botName, owner: config.ownerName }); });

app.get('/pair', async (req, res) => {
  const number = req.query.number?.replace(/[^0-9]/g, '');
  if (!number) return res.json({ error: 'Enter number' });
  if (!sock) await startBot();
  try { const code = await sock.requestPairingCode(number); res.json({ code }); }
  catch (e) { res.json({ error: 'Failed. Try again. ' + e.message }); }
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_blast');
  sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: Browsers.macOS('Safari'), printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') { const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut; if (shouldReconnect) startBot(); }
    else if (connection === 'open') { console.log('✅ BLAST BOT CONNECTED - Owner: ' + config.ownerName); }
  });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const from = m.key.remoteJid;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if (!text.startsWith(config.prefix)) {
      if (['hi','hello','bonjour','salut'].includes(text.toLowerCase())) {
        await sock.sendMessage(from, { text: withChannel(`Hello! Welcome to *${config.botName}* by *${config.ownerName}*\n\nType *${config.prefix}menu* to see all services.`) });
      }
      return;
    }
    const cmd = text.slice(1).trim().split(' ')[0].toLowerCase();
    if (cmd === 'menu' || cmd === 'help') await menuCmd(sock, from);
    if (cmd === 'info') await infoCmd(sock, from);
    if (cmd === 'ping') await sock.sendMessage(from, { text: withChannel('Pong! BLAST BOT is fast - Speed: 0.02s') });
    if (cmd === 'owner') await sock.sendMessage(from, { text: withChannel(`*Owner:* ${config.ownerName}\n*Number:* +${config.owner}\n*WhatsApp:* https://wa.me/${config.owner}`) });
    if (cmd === 'price') await sock.sendMessage(from, { text: withChannel(`*BLAST TECHNOLOGY - PRICE LIST*\n\n• Website Landing Page - Contact us\n• Full Website - Contact us\n• WhatsApp Bot - Contact us\n• Website Security - Contact us\n• Video / Photo Editing - Contact us\n\nOrder now: https://wa.me/${config.owner}`) });
    if (cmd === 'order' || cmd === 'website' || cmd === 'bot') await sock.sendMessage(from, { text: withChannel(`You want to order? Great!\n\nSend us:\n1. Your name\n2. What you need (Website / Bot / Editing)\n3. Your budget\n\nWe reply fast: https://wa.me/${config.owner}`) });
    if (cmd === 'support') await sock.sendMessage(from, { text: withChannel(`Support - ${config.ownerName}\nWe are here for you. Message us: https://wa.me/${config.owner}`) });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log('Server on ' + PORT); startBot(); });
module.exports = app;
