const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const songsPath = "./songs";
const songs = fs.readdirSync(songsPath).filter((el) => el.endsWith(".mp3"));
console.log(`🎶 Welcome to the Songs App 🎶\n`);
for (let i = 0; i < songs.length; i++) {
  console.log(`${i + 1}: ${songs[i].split(".")[0]}`);
}
console.log(`\n🎵 Select a number to play the song`);
console.log(`p = pause | r = resume | q = quit\n`);
process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);
let childProcess = null;
process.stdin.on("data", (input) => {
  const userInput = input.toString().trim();
  if (userInput === "q") {
    if (childProcess) {
      childProcess.kill("SIGCONT");
      childProcess.kill("SIGTERM");
    }
    process.stdin.setRawMode(false);
    process.stdin.pause();
    console.log("👋 Goodbye!");
    process.exit(0);
  }
  if (userInput === "p") {
    pause();
    return;
  }
  if (userInput === "r") {
    resume();
    return;
  }
  if (userInput > 0 && userInput <= songs.length) {
    player(+userInput);
  }
});
function player(userInput) {
  console.log(`Selected Song: ${songs[userInput - 1]}`);

  if (childProcess) {
    childProcess.kill("SIGCONT");
    childProcess.kill("SIGTERM");
  }
  const songPath = path.join(songsPath, songs[userInput - 1]);
  childProcess = spawn("afplay", [songPath]);
  childProcess.on("close", () => {
    console.log("Song finished...");
    childProcess = null;
  });
}
function pause() {
  if (childProcess) {
    childProcess.kill("SIGSTOP");
    console.log("⏸️ Song paused");
  }
}
function resume() {
  if (childProcess) {
    childProcess.kill("SIGCONT");
    console.log("▶️ Song resumed");
  }
}