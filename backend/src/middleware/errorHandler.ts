import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error('Request error', err, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
  })

  // Determine status code
  const statusCode = (err as any).statusCode || 500

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: (err as any).code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    },
    timestamp: new Date().toISOString(),
  })
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  })

  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      path: req.path,
    },
    timestamp: new Date().toISOString(),
  })
}

/**
 * Request logger middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    })
  })

  next()
}
