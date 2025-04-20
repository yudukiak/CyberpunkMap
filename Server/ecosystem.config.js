module.exports = {
  apps: [
    {
      name: 'CyberpunkMap',
      script: './server.js',
      cwd: new URL('.', import.meta.url).pathname,
    }
  ]
}
