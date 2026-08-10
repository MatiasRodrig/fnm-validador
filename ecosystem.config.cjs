module.exports = {
  apps: [
    {
      name: 'fndlm26-validator',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 6101',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 6101
      },
      watch: false,
      autorestart: true,
      max_restarts: 10
    }
  ]
};
