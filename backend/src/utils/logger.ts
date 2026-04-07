/**
 * Production-ready logger utility
 * Supports different log levels and structured logging
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production'
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    
    if (this.isDevelopment) {
      // Pretty format for development
      let log = `[${timestamp}] ${level}: ${message}`
      if (context) {
        log += `\n  Context: ${JSON.stringify(context, null, 2)}`
      }
      if (error) {
        log += `\n  Error: ${error.message}\n  Stack: ${error.stack}`
      }
      return log
    } else {
      // JSON format for production (easier to parse by log aggregators)
      return JSON.stringify({
        level,
        message,
        timestamp,
        context,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : undefined,
      })
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    const formatted = this.formatLog(entry)

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted)
        }
        break
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }
}

export const logger = new Logger()
