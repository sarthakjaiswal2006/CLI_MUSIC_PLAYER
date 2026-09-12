const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const songsPath = "./songs";

const songs = fs
  .readdirSync(songsPath)
  .filter((el) => el.endsWith(".mp3"));

console.log(`🎶 Welcome to the Songs App 🎶\n`);

for (let i = 0; i < songs.length; i++) {
  console.log(`${i + 1}: ${songs[i].split(".")[0]}`);
}

console.log(`\n🎵 Select a number to play the song`);
console.log(`p = pause | r = resume | n = next | b = previous | q = quit\n`);

process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);

let childProcess = null;
let currentSong = -1;
let isQuitting = false;
let changingSong = false;

process.stdin.on("data", (input) => {
  const userInput = input.toString().trim();

  if (userInput === "q") {
    quit();
    return;
  }

  if (userInput === "p") {
    pause();
    return;
  }

  if (userInput === "r") {
    resume();
    return;
  }

  if (userInput === "n") {
    nextSong();
    return;
  }

  if (userInput === "b") {
    previousSong();
    return;
  }

  if (userInput > 0 && userInput <= songs.length) {
    player(+userInput);
  }
});

function player(userInput) {
  if (changingSong) return;

  currentSong = userInput - 1;

  if (childProcess) {
    changingSong = true;

    const oldProcess = childProcess;

    oldProcess.once("close", () => {
      if (isQuitting) return;

      childProcess = null;
      changingSong = false;

      startSong();
    });

    try {
      oldProcess.kill("SIGCONT");
      oldProcess.kill("SIGTERM");
    } catch (error) {}

    return;
  }

  startSong();
}

function startSong() {
  const songPath = path.join(
    songsPath,
    songs[currentSong]
  );

  console.log(`🎵 Playing: ${songs[currentSong]}`);

  childProcess = spawn("afplay", [songPath]);

  childProcess.once("close", () => {
    childProcess = null;

    if (!isQuitting) {
      console.log("Song finished...");
    }
  });
}

function nextSong() {
  if (currentSong === -1) {
    console.log("Select a song first");
    return;
  }

  currentSong =
    (currentSong + 1) % songs.length;

  player(currentSong + 1);
}

function previousSong() {
  if (currentSong === -1) {
    console.log("Select a song first");
    return;
  }

  currentSong =
    (currentSong - 1 + songs.length) % songs.length;

  player(currentSong + 1);
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

function quit() {
  isQuitting = true;

  if (!childProcess) {
    closeApp();
    return;
  }

  const oldProcess = childProcess;
  const pid = oldProcess.pid;

  oldProcess.once("close", () => {
    childProcess = null;
    closeApp();
  });

  try {
    oldProcess.kill("SIGCONT");
    oldProcess.kill("SIGTERM");
  } catch (error) {}

  setTimeout(() => {
    try {
      process.kill(pid, "SIGKILL");
    } catch (error) {}
  }, 200);
}
function closeApp() {
  process.stdin.setRawMode(false);
  process.stdin.pause();

  console.log("👋 Goodbye!");
  process.exit(0);
}