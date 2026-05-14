type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatMessage = (level: LogLevel, message: string, context: string = ''): string => {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` [${context}]` : '';
  return `${timestamp} | ${level.toUpperCase().padEnd(7)} |${ctx} ${message}`;
};

export const logger = {
  info: (message: string, context?: string) => console.log(formatMessage('info', message, context)),
  warn: (message: string, context?: string) => console.warn(formatMessage('warn', message, context)),
  error: (message: string, context?: string) => console.error(formatMessage('error', message, context)),
  debug: (message: string, context?: string) => console.debug(formatMessage('debug', message, context)),
};
