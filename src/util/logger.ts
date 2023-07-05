import log4js, { Configuration } from 'log4js';

const log4jsConfig: Configuration = {
  appenders: {
    out: { type: 'stdout' },
  },
  categories: {
    default: { appenders: ['out'], level: 'info' },
  },
};

log4js.configure(log4jsConfig);

const logger = log4js.getLogger();

export default logger;