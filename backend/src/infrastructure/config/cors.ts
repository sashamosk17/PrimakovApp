import { CorsOptions } from 'cors';

const getAllowedOrigins = (): { strings: string[], patterns: RegExp[] } => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    return {
      strings: [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:59099',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:59099',
      ],
      patterns: [
        // Allow any localhost port for flexibility in development
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ]
    };
  }

  // Production: read from environment variable
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) {
    throw new Error('ALLOWED_ORIGINS must be set in production');
  }

  return {
    strings: origins.split(',').map(o => o.trim()),
    patterns: []
  };
};

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const { strings: allowedStrings, patterns: allowedPatterns } = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is explicitly allowed
    if (allowedStrings.includes(origin)) {
      return callback(null, true);
    }

    // Check if origin matches any regex pattern (for localhost ports)
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed strings:', allowedStrings);
      console.log('Allowed patterns:', allowedPatterns);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
