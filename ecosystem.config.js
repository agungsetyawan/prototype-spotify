module.exports = {
  apps: [
    {
      name: 'spotify',
      script: './bin/www',
      time: true,
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: './',
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        CLIENT_ID: '312f0f7a6e4e44059ed2ad2cbce2815b',
        CLIENT_SECRET: '44cb5695e13044bcb061dfd3c9993d0f',
        REDIRECT_URI: 'http://localhost:3001/callback/',
        DB: 'mongodb+srv://spotify:spotify@spotify-zrfvd.mongodb.net/spotify',
        GENIUS_CLIENT_ACCESS_TOKEN:
          'CuSy19nnzVQqU_vt97wk3dZo93dlKtpuk9W9pWfy8wxw-gqymD507jN8t3yJDN1l'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        CLIENT_ID: '312f0f7a6e4e44059ed2ad2cbce2815b',
        CLIENT_SECRET: '44cb5695e13044bcb061dfd3c9993d0f',
        REDIRECT_URI: 'https://spotify.wkwk.fun/callback/',
        DB: 'mongodb+srv://spotify:spotify@spotify-zrfvd.mongodb.net/spotify',
        GENIUS_CLIENT_ACCESS_TOKEN:
          'CuSy19nnzVQqU_vt97wk3dZo93dlKtpuk9W9pWfy8wxw-gqymD507jN8t3yJDN1l'
      }
    }
  ],

  deploy: {
    production: {
      key: './setyawan.pem',
      user: 'ubuntu',
      host: '18.139.163.225',
      ref: 'origin/master',
      repo: 'git@bitbucket.org:agungsetyawan/prototype_spotify.git',
      path: '/home/ubuntu/spotify',
      'post-setup': 'bash setup.sh',
      'post-deploy': 'npm install && npm run pm2:production'
    }
  }
};
