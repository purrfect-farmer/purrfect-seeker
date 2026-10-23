const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, ".env");
const env = fs.existsSync(envPath)
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};

module.exports = {
  apps: [
    {
      name: env.PM2_APP_NAME ?? "purrfect-seeker",
      script: "pnpm",
      args: "start --options",
      interpreter: "none",
      cwd: __dirname,
      env: {
        PORT: env.PORT ?? 3000,
        NODE_ENV: env.NODE_ENV ?? "production",
        FORCE_COLOR: true,
      },
    },
  ],
};
