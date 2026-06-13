const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Sèvi ak fichye front-end
app.use(express.static('public'));
app.use(express.json());

let qrCodeData = null;
let clientReady = false;
let client = null;

// Inisyalizasyon WhatsApp Client
function initWhatsAppClient() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('QR CODE resevwa');
    QRCode.toDataURL(qr, (err, url) => {
      if (!err) {
        qrCodeData = url;
        io.emit('qr', url);
      }
    });
  });

  client.on('ready', () => {
    console.log('WhatsApp Bot pare!');
    clientReady = true;
    qrCodeData = null;
    io.emit('ready', { message: '✅ WhatsApp Bot konekte! Ou ka voye mesaj.' });
  });

  client.on('message', async (message) => {
    console.log(`Mesaj resevwa: ${message.body}`);
    // Reponn otomatik
    if (!message.fromMe) {
      await message.reply("🤖 FAST AI Bot — Mwen resevwa mesaj ou! Nan vèsyon API, m ap reponn kesyon ou yo.");
    }
  });

  client.initialize();
}

initWhatsAppClient();

// Endpoint pou voye mesaj
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;
  if (!clientReady) {
    return res.json({ success: false, error: 'WhatsApp pa konekte ankò' });
  }
  try {
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
    await client.sendMessage(chatId, message);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Endpoint pou jwenn QR
app.get('/qr-status', (req, res) => {
  res.json({ qr: qrCodeData, ready: clientReady });
});

// Socket.io koneksyon
io.on('connection', (socket) => {
  console.log('Client konekte');
  if (qrCodeData) socket.emit('qr', qrCodeData);
  if (clientReady) socket.emit('ready', { message: 'WhatsApp bot deja konekte!' });
});

server.listen(3000, () => {
  console.log('Server lanse sou http://localhost:3000');
});
