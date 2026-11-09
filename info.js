const config = require('../config');
module.exports = async (sock, from) => {
  const info = `
*${config.botName} - BOT INFO*

*Owner:* ${config.ownerName}
*Number:* +${config.owner}
*Version:* ${config.version}
*Status:* Online 24/7
*Services:* Website, Security, WhatsApp Bot, Editing, Coding, Ethical Hacking

*Need a solution?*
WhatsApp: https://wa.me/${config.owner}

*📢 JOIN OUR CHANNEL:*
*${config.channelName}*
${config.channel}

_${config.footer}_
`;
  await sock.sendMessage(from, { text: info });
}
