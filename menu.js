const config = require('../config');
module.exports = async (sock, from) => {
  const menu = `
*╭─── ❰ ${config.botName} ❱ ───╮*
*│*
*│  *OWNER:* ${config.ownerName}
*│  *NUMBER:* +${config.owner}
*│  *VERSION:* ${config.version}
*│  *PREFIX:* ${config.prefix}
*│*
*├── ❰ MAIN MENU ❱*
*│*
*│  • ${config.prefix}menu - Show menu*
*│  • ${config.prefix}info - Bot info*
*│  • ${config.prefix}ping - Speed test*
*│  • ${config.prefix}owner - Owner contact*
*│*
*├── ❰ BUSINESS ❱*
*│*
*│  • ${config.prefix}price - Price list*
*│  • ${config.prefix}order - Make order*
*│  • ${config.prefix}website - Order website*
*│  • ${config.prefix}bot - Order WhatsApp Bot*
*│  • ${config.prefix}support - Support*
*│*
*├── ❰ TOOLS ❱*
*│*
*│  • ${config.prefix}sticker - Photo to sticker*
*│  • ${config.prefix}ai - Ask AI*
*│  • ${config.prefix}security - Website Security*
*│  • ${config.prefix}editor - Video / Photo Editor*
*│*
*╰──────────────╯*

*📢 JOIN OUR CHANNEL:*
*${config.channelName}*
${config.channel}

_${config.footer} - Type ${config.prefix}menu to see menu_`;
  await sock.sendMessage(from, { text: menu });
}
