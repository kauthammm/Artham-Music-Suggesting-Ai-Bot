const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function resolveLevel(level) {
  const key = String(level || 'info').toLowerCase();
  return LEVELS[key] ?? LEVELS.info;
}

function safeSerialize(value) {
  try {
    return JSON.stringify(value);
  } catch (_) {
    return '"[unserializable]"';
  }
}

function createLogger({ service = 'artham', level = 'info' } = {}) {
  const threshold = resolveLevel(level);

  function emit(lvl, msg, meta) {
    if (resolveLevel(lvl) < threshold) return;

    const payload = {
      time: new Date().toISOString(),
      level: lvl,
      service,
      msg
    };

    if (meta && typeof meta === 'object') {
      Object.assign(payload, meta);
    }

    const line = safeSerialize(payload);
    if (lvl === 'error') console.error(line);
    else if (lvl === 'warn') console.warn(line);
    else console.log(line);
  }

  return {
    debug: (msg, meta) => emit('debug', msg, meta),
    info: (msg, meta) => emit('info', msg, meta),
    warn: (msg, meta) => emit('warn', msg, meta),
    error: (msg, meta) => emit('error', msg, meta)
  };
}

module.exports = {
  createLogger
};
