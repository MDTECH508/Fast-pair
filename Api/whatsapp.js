// api/whatsapp.js
export default async function handler(req, res) {
  // Aktive CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, number, message, code } = req.body;

  // ========== 1. JENERE QR CODE (simile) ==========
  if (action === 'getQR') {
    // QR code la ap dirije itilizatè a nan WhatsApp liy dirèk
    const waLink = `https://wa.me/qr/${Date.now()}`;
    // Jenere yon QR ki mennen nan yon lyen WhatsApp
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waLink)}`;
    return res.json({
      success: true,
      qr: qrDataUrl,
      message: "Scan QR la ak WhatsApp ou — l ap ouvri yon chat ak bot la"
    });
  }

  // ========== 2. PAIR CODE (jenere yon kòd) ==========
  if (action === 'generatePairCode') {
    // Jenere yon kòd aleatwa 8 chif
    const pairCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    // Store nan memwa (pou demos) — nan pratik itilize Redis oswa DB
    global.pairCode = pairCode;
    global.pairCodeExpiry = Date.now() + 5 * 60 * 1000; // 5 minit
    return res.json({
      success: true,
      code: pairCode,
      instructions: "Ale nan WhatsApp → Appareils liés → Associer un appareil → Antre kòd sa a"
    });
  }

  // ========== 3. VERIFY PAIR CODE ==========
  if (action === 'verifyPair') {
    if (global.pairCode === code && global.pairCodeExpiry > Date.now()) {
      global.whatsappConnected = true;
      return res.json({ success: true, message: "Koneksyon verifye! Bot pare." });
    }
    return res.json({ success: false, error: "Kòd pa valab oswa ekspire" });
  }

  // ========== 4. VOYE MESAJ (via API ekstèn) ==========
  if (action === 'sendMessage') {
    const { phone, message: msg } = req.body;
    
    // Opsyon 1: CallMeBot API (gratis, limit)
    // Opsyon 2: UltraMsg (bezwen kle)
    // Opsyon 3: GreenAPI (gratis pou tès)
    
    // Mete kle API ou a (gratis)
    const CALLMEBOT_API_KEY = "VOTRE_API_KEY_CALLMEBOT"; // Jwenn sou callmebot.com
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(msg)}&apikey=${CALLMEBOT_API_KEY}`;
    
    try {
      const response = await fetch(url);
      const result = await response.text();
      return res.json({ success: true, result });
    } catch (error) {
      return res.json({ success: false, error: error.message });
    }
  }

  // ========== 5. RESEVWA MESAJ (webhook) ==========
  if (action === 'webhook') {
    const { from, message, timestamp } = req.body;
    // Istore mesaj yo pou AI a trete
    console.log(`Mesaj de ${from}: ${message}`);
    
    // Reponn ak AI
    const aiResponse = await callAI(message);
    
    return res.json({ 
      success: true, 
      reply: aiResponse,
      to: from 
    });
  }

  return res.status(400).json({ error: "Aksyon pa rekonèt" });
}

// Fonksyon pou rele AI a (Gemini/Mistral/Claude)
async function callAI(question) {
  // Mete kle AI ou a isit
  const GEMINI_API_KEY = "AQ.Ab8RN6Laqr2jZzWnfxCiMtxl5IlZclP13e-cwCzYfgzWwVbgKQ";
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Reponn an Kreyòl Ayisyen. ${question}` }]
          }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Mwen pa kapab reponn kounye a.";
  } catch (error) {
    return `Erè: ${error.message}`;
  }
}
