module.exports = {
    apps: [
      {
        name: "tele-bot",
        script: "./dist/index.js",
        watch: ["./dist"],
        ignore_watch: ["node_modules", "client/img"],
        watch_options: {
          followSymlinks: false,
        },
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };