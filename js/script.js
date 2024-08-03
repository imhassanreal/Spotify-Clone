console.log("let's write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
      return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
currFolder = folder;
let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
let response = await a.text();
console.log(response);
let div = document.createElement("div")
div.innerHTML = response;
let as = div.getElementsByTagName("a")
songs = []
for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")){
        songs.push(element.href.split(`/${folder}/`)[1])
    }
    
}

let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
songUL.innerHTML = ""
   for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li> 
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
          
                  <div></div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt="">
                </div>
     </li>`;
   }

   Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click", element=>{
      console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

    })
   })

return songs 
}

const playMusic = (track, pause=false)=>{
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currFolder}/` + track
  if(!pause){
    currentSong.play()
    play.src = "img/pause.svg"
  }
  
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}


async function displayAlbums() {
  try {
    let response = await fetch(`http://127.0.0.1:5500/songs/`);
    if (!response.ok) {
      throw new Error('Failed to fetch songs list');
    }
    let html = await response.text();
    
    // Create a temporary div to parse the HTML response
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Find all <a> tags within the parsed HTML
    let anchors = tempDiv.getElementsByTagName('a');

    let cardContainer = document.querySelector('.cardContainer');
    if (!cardContainer) {
      throw new Error('Element with class "cardContainer" not found');
    }

    // Loop through each anchor tag
    for (let i = 0; i < anchors.length; i++) {
      let anchor = anchors[i];
      if (anchor.href.includes("/songs/")) {
        let folder = anchor.href.split("/songs/").pop();

        // Fetch info.json for the current folder
        let infoResponse = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        if (!infoResponse.ok) {
          throw new Error(`Failed to fetch info for folder ${folder}`);
        }

        // Parse JSON response from info.json
        let info = await infoResponse.json();

        // Create card HTML string
        let cardHTML = `
          <div class="card" data-folder="${folder}">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
          </div>
        `;

        // Append card HTML to cardContainer
        cardContainer.innerHTML += cardHTML;
      }
    }

    // Add click event listener to each card
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', async () => {
        console.log('Fetching Songs');
        let folder = card.dataset.folder;
        let songs = await getSongs(`songs/${folder}`);
        playMusic(songs[0]);
      });
    });

  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}


async function main(){
  
   await getSongs("songs/ncs")
    console.log(songs)
    playMusic(songs[0], true)
    
    displayAlbums()

   play.addEventListener("click", ()=>{
    if(currentSong.paused){
      currentSong.play()
      play.src = "img/pause.svg"
    }
    else{
      currentSong.pause()
      play.src = "img/play.svg"
    }
   })

   currentSong.addEventListener("timeupdate", ()=>{
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)*100 + "%";
   })
   document.querySelector(".seekbar").addEventListener("click", e=>{
    let percent = (e.offsetX/e.target.getBoundingClientRect().width) *100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration)* percent)/100
   })

   document.querySelector(".hamburger").addEventListener("click", ()=>{
    document.querySelector(".left").style.left ="0"
   })


   document.querySelector(".close").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "-120%"
   })

   previous.addEventListener("click", ()=>{
    console.log("Previous clicked");
    console.log(currentSong);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index-1) >= 0){
      playMusic(songs[index-1])
    }
  })
  
  next.addEventListener("click", ()=>{
    console.log("Next clicked");
    // console.log(currentSong.src);

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index+1) < songs.length){
      playMusic(songs[index+1])
    }
  })

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    currentSong.volume = parseInt(e.target.value)/100
  })

  document.querySelector(".volume>img").addEventListener("click",e=>{
  if(e.target.src.includes("volume.svg")){
    e.target.src = e.target.src.replace ("volume.svg", "mute.svg")
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0; 
  }
  else{
    e.target.src = e.target.src.replace ("mute.svg", "volume.svg")
    currentSong.volume = .10;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10; 
  }
  })


}   
main()   
