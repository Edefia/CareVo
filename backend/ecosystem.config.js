module.exports = {
  apps: [
    {
      name: 'carebis-prime-api',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 3000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
      watch: false,
    },
  ],
};
