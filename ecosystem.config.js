module.exports = {
  apps: [
    {
      name: "image-api-3001",
      cwd: "./backend",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    },
    {
      name: "image-api-3002",
      cwd: "./backend",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      }
    }
  ]
};

