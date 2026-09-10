const { spawn } = require("child_process");
const fs = require("fs");

// Read all the mp3 files
const path = "./songs";
const songs = fs.readdirSync(path).filter((el) => el.endsWith(".mp3"));
