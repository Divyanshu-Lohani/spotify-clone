const playlist = document.getElementsByClassName("songs-playlist")[0];
const songsLi = document.getElementsByClassName("songs");
const playButton = document.querySelector(".play");
const prevButton = document.querySelector(".previous");
const nextButton = document.querySelector(".next");
const playingSongName = document.querySelector(".playing-song-name");
const Songduration = document.querySelector(".duration");
const seekBar = document.querySelector(".seekbar");

let fileNames = [];
let albumNames = [];
let audio = new Audio(`./Songs/ANTENNA/Yui - Again.mp3`);
let currentFolder = "ANTENNA";

let currentSong = "Yui - Again.mp3";

function secondsToMinutesSeconds(seconds) {
  const minutes = Math.floor(seconds / 60); // Calculate the number of full minutes
  const remainingSeconds = Math.floor(seconds % 60); // Calculate the remaining seconds
  // Pad single-digit seconds with a leading zero
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

async function main(currentFolder) {
  await getSongsName(currentFolder);
  createSongList();
  if (fileNames.length > 0) {
    currentSong = fileNames[0]; // Set the first song as the current song
    audio.src = `./Songs/${currentFolder}/${currentSong}`;
    changePlayingSongName();
  }
  playSongs(currentFolder);
}

async function getSongsName(currentFolder) {
  try {
    const response = await fetch(`/songs/${currentFolder}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const htmlString = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const as = doc.querySelectorAll("a");

    as.forEach((a) => {
      const href = a.getAttribute("href");
      const decodedHref = decodeURIComponent(href);
      const fileName = decodedHref.split("/").pop();
      if (fileName.endsWith(".mp3")) {
        fileNames.push(fileName);
      }
    });
  } catch (error) {
    console.error("Error fetching or parsing the HTML:", error);
  }
}

function createSongList() {
  // Clear the playlist first
  playlist.innerHTML = "";

  // Create new songs list
  for (let i = 0; i < fileNames.length; i++) {
    const element = fileNames[i];
    const li = document.createElement("li");
    li.innerHTML = `<img src="/svg/music.svg" alt="music-icon">
        <div class="songInfo">
            <div>${element}</div>
        </div>
        <div class="playnow">
            <span> Play now</span>
            <img src="/svg/play.svg" alt="play-icon">
        </div>`;
    playlist.appendChild(li);
    li.classList.add("songs", "pointer");
  }
}

// Add event listener to each song in the playlist
function playSongs() {
  const songsLi = document.getElementsByClassName("songs");
  // Add event listener for playlist
  for (let i = 0; i < songsLi.length; i++) {
    songsLi[i].addEventListener("click", () => {
      const fileName = fileNames[i];
      currentSong = fileName;
      changeAudioSrc();
    });
  }
}

// Event listener for the play button
playButton.addEventListener("click", () => {
  if (audio.paused) {
    audio.play(); // Start playback
    playButton.setAttribute("src", "./svg/pause.svg");
  } else {
    audio.pause(); // Pause playback
    playButton.setAttribute("src", "./svg/play.svg");
  }

  changePlayingSongName();
});

// Add event listener for previous button
prevButton.addEventListener("click", () => {
  let prevSongIndex = fileNames.indexOf(currentSong) - 1;
  if (prevSongIndex >= 0) {
    let prevSong = fileNames[prevSongIndex];
    currentSong = prevSong;
    changeAudioSrc();
  }
});

// Add event listener for next button
nextButton.addEventListener("click", () => {
  let nextSongIndex = fileNames.indexOf(currentSong) + 1;
  if (nextSongIndex < fileNames.length) {
    let nextSong = fileNames[nextSongIndex];
    currentSong = nextSong;
    changeAudioSrc();
  }
});

function changeAudioSrc() {
  audio.src = `./Songs/${currentFolder}/${currentSong}`;
  playButton.setAttribute("src", "./svg/pause.svg");
  audio.play();
  changePlayingSongName();
}

function changePlayingSongName() {
  playingSongName.innerText = currentSong;
}

changePlayingSongName();

// // Sync button icon with audio state
// audio.addEventListener("play", () => {
//   playButton.setAttribute("src", "./svg/pause.svg");
//   console.log("Audio is playing");
// });

// audio.addEventListener("pause", () => {
//   playButton.setAttribute("src", "./svg/play.svg");
//   console.log("Audio is paused");
// });

// Add event listener for timeupdate event
audio.addEventListener("timeupdate", () => {
  if (!isNaN(audio.duration)) {
    const progress = (audio.currentTime / audio.duration) * 100; // Calculate progress
    seekBar.value = progress; // Update seekbar value
    seekBar.style.background = `linear-gradient(to right, #1ed760 ${progress}%, #ffffff ${progress}%)`;

    Songduration.innerHTML = `${secondsToMinutesSeconds(
      audio.currentTime
    )} / ${secondsToMinutesSeconds(audio.duration)}`;
  }

  // Sync the seekbar with the audio's playback progress
  if (document.activeElement !== seekBar) {
    seekBar.value = (audio.currentTime / audio.duration) * 100;
  }
});

// Load audio metadata to set up the seekbar
audio.addEventListener("loadedmetadata", () => {
  seekBar.max = 100; // Seekbar range 0-100
  seekBar.value = 0; // Start from the beginning
});

// Update the audio's currentTime based on seekbar value
const updateAudioTime = () => {
  const newTime = (seekBar.value / 100) * audio.duration;
  audio.currentTime = newTime;
};

// Handle input event (for both dragging and clicking)
seekBar.addEventListener("input", () => {
  updateAudioTime();
});

// Sync the seekbar with the audio's playback progress
// audio.addEventListener("timeupdate", () => {
//   if (document.activeElement !== seekBar) {
//     seekBar.value = (audio.currentTime / audio.duration) * 100;
//   }
// });

// Add event listener for hamburger
const hamburger = document.querySelector(".hamburger");
const leftParent = document.querySelector(".left-parent");

// Toggle logic
hamburger.addEventListener("click", () => {
  if (leftParent.style.left === "0px") {
    // Close the menu and switch to the hamburger icon
    leftParent.style.left = "-100%"; // Adjust this to hide the menu
    hamburger.innerHTML = `<img src="svg/hamburger.svg">`;
  } else {
    // Open the menu and switch to the cross icon
    leftParent.style.left = "0";
    hamburger.innerHTML = `<img src="svg/cross.svg">`;
  }
});

// Add event listener for volume input range
const volInput = document.querySelector(".range input");

volInput.addEventListener("change", (e) => {
  const volume = e.target.value / 100;
  audio.volume = volume;
  updateVolumeIcon(audio.volume);
  changeVolBarColor();
});

// Change background color whenever user interacts with volume
const volumeBar = document.querySelector(".vol-seekbar");

window.addEventListener("DOMContentLoaded", () => {
  volumeBar.max = 100; // Set the max value of the volume bar
  volumeBar.value = 100; // Set the initial value to 100 (start from full volume)
  changeVolBarColor();
});

function changeVolBarColor() {
  const value = volumeBar.value;
  const percentage = (value / volumeBar.max) * 100;
  volumeBar.style.background = `linear-gradient(to right, #1ed760 ${percentage}%, #e0e0e0 ${percentage}%)`;
}

volumeBar.addEventListener("input", () => {
  audio.volume = volumeBar.value / 100; // Sync volume with the slider
  updateVolumeIcon(audio.volume);
  changeVolBarColor();
});

// Function to update the volume icon based on the current volume
function updateVolumeIcon(volume) {
  const volumeIcon = document.querySelector(".volume > img");
  if (volume === 0) {
    volumeIcon.setAttribute("src", "svg/mute.svg");
  } else {
    volumeIcon.setAttribute("src", "svg/volume.svg");
  }
}

// State to track if the audio is muted or not
let isMuted = false;
let previousVolume = 1; // Default volume is 1 (100%)

document.querySelector(".volume > img").addEventListener("click", () => {
  if (audio.volume === 0) {
    // If volume is currently 0, unmute it
    audio.volume = previousVolume; // Restore to the previous volume
    volInput.value = audio.volume * 100; // Update slider to previous volume
    volumeBar.value = audio.volume * 100; // Update volume bar as well
    isMuted = false;
    updateVolumeIcon(audio.volume);
  } else {
    // If volume is greater than 0, mute the audio
    previousVolume = audio.volume; // Save current volume before muting
    audio.volume = 0; // Mute the audio
    volInput.value = 0; // Update slider to show 0 volume
    volumeBar.value = 0; // Set volume bar to 0 as well
    isMuted = true;
    updateVolumeIcon(audio.volume);
  }
  changeVolBarColor();
});

async function getAlbumNames() {
  const response = await fetch(`/songs`);
  if (!response.ok) {
    throw new Error(`HTTP error! Status ${response.status}`);
  }

  const htmlString = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const as = doc.querySelectorAll("a");
  as.forEach((a) => {
    const href = a.getAttribute("href");
    if (href.startsWith("/songs/")) {
      const albumName = href.split("/").pop();
      albumNames.push(albumName);
    }
  });

  // Display albums on the screen
  await Promise.all(
    albumNames.map(async (element) => {
      const response = await fetch(`/songs/${element}/info.json`);
      const json = await response.json();

      document.querySelector(
        ".rectangle-artist-list"
      ).innerHTML += `<div class="pointer hover-container">
                                    <div class="rectangle">
                                        <div class="img-comp">
                                            <img class="cover-img" src="/songs/${element}/cover.jpeg">
                                        </div>
                                        <h4>${json.title}</h4>
                                        <p>${json.description}</p>
                                    </div>
                                </div>`;
    })
  );

  attachAlbumListener();
}

function attachAlbumListener() {
  // Convert "rectangle" elements to an array and loop through them
  Array.from(document.getElementsByClassName("rectangle")).forEach(
    (element) => {
      // Add click listener for album names
      element.addEventListener("click", () => {
        playButton.setAttribute("src", "./svg/play.svg");
        fileNames = [];
        currentFolder = "";
        let folderName = element.querySelector("h4").innerText; // Get folder name
        currentFolder = folderName; // Update current folder
        currentSong = ""; // Reset current song
        main(currentFolder); // Call main function with the current folder
      });
    }
  );
}

let isInitialized = false;

if (fileNames.length === 0 && !isInitialized) {
  isInitialized = true;
  main("ANTENNA");
}

getAlbumNames();

document.querySelectorAll(".home, .logo").forEach((element) => {
  element.addEventListener("click", () => {
    fileNames = [];
    currentFolder = "";
    currentSong = ""; // Reset current song

    main("ANTENNA");
  });
});
