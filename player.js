const { spawn } = require("child_process");
const fs = require("fs");
const path = "./songs";
const songs = fs.readdirSync(path).filter((el) => el.endsWith(".mp3"));
