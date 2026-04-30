// Fichier de configuration PM2 pour O2switch
// Usage : pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'benovl',
      script: '.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Renseignez les variables ci-dessous ou créez un fichier .env
        // DATABASE_PROVIDER: 'mysql',
        // DATABASE_URL: 'mysql://user:password@localhost:3306/benovl',
        // JWT_SECRET: '',
        // JWT_REFRESH_SECRET: '',
      },
    },
  ],
}
