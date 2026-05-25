const { runChat, streamChat, getWelcomeMessage: getWelcome } = require('./ai/aiRouter');
const { extractMusicControl, getSongsForControl } = require('./ai/musicControl');
const { generateLocalFallback } = require('./ai/providers/localProvider');

async function processChat(messages, userContext = {}) {
  return runChat(messages, userContext);
}

async function processChatStream(messages, userContext = {}, onToken) {
  return streamChat(messages, userContext, onToken);
}

async function getWelcomeMessage() {
  return getWelcome();
}

module.exports = {
  processChat,
  processChatStream,
  getWelcomeMessage,
  extractMusicControl,
  getSongsForControl,
  generateLocalFallback
};
