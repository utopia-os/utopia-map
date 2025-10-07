module.exports = {
  // Directus connection settings
  directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055',
  directusEmail: process.env.DIRECTUS_EMAIL || 'admin@it4c.dev',
  directusPassword: process.env.DIRECTUS_PASSWORD || 'admin123',
  
  // Sync settings
  dumpPath: './directus-config/development',
  seedPath: './directus-config/development/seed',
  
  // Reduce verbosity of dependency warnings
  logLevel: 'info',
  
  // Increase timeout for complex operations
  timeout: 30000,
  
  // Retry settings for dependency resolution
  maxRetries: 5,
  retryDelay: 1000
}
