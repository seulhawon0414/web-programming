const genreSelect = document.getElementById("genre");
const rankingTitle = document.getElementById("rankingTitle");
const rankingRow = document.querySelector(".ranking-row");

let moviesData = {};
let allMovies = [];

const genreColors = {
  hot: "#f5f5f5",
  romance: "#FFF0F5",     
  comedy: "#FFF9C4",     
  sf: "#E3F2FD",          
  fantasy: "#EDE7F6",     
  animation: "#E0F2F1",   
  action: "#FFE0B2"       
};


fetch("movies.json")
  .then(res => res.json())
  .then(data => {
    moviesData = data;

    allMovies = [];
    Object.values(moviesData).forEach(arr => {
      allMovies = allMovies.concat(arr);
    });
    updatePersonalRecommendation();
    const savedGenre = localStorage.getItem("selectedGenre");

    if (savedGenre && moviesData[savedGenre]) {
      genreSelect.value = savedGenre;
      updateMovies(savedGenre);
    } else {
      updateMovies("hot");
    }
  });



genreSelect.addEventListener("change", () => {
  const selected = genreSelect.value;
  localStorage.setItem("selectedGenre", selected);
  updateMovies(selected);
});


//관심 콘텐츠 저장 기능


function saveInterestContent(movie) {
  let interest = JSON.parse(localStorage.getItem("interestContents")) || [];
  interest = interest.filter(item => item.title !== movie.title);
  interest.unshift(movie);
  if (interest.length > 5) interest.pop();

  localStorage.setItem("interestContents", JSON.stringify(interest));
  renderInterestContents();
}


function renderInterestContents() {
  const row = document.getElementById("interestRow");
  if (!row) return;

  const interest = JSON.parse(localStorage.getItem("interestContents")) || [];
  row.innerHTML = "";

  interest.forEach(movie => {
    const card = `
      <div class="ranking-card">
        <a href="14_sookplay_page1.html">
          <img src="${movie.img}" class="movieposter">
        </a>
        <p class="movietitle">${movie.title}</p>
      </div>
    `;
    row.innerHTML += card;
  });
}

// 영화 클릭 시 관심 콘텐츠 저장
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("movieposter")) {
    const card = e.target.closest(".ranking-card");
    const title = card.querySelector(".movietitle").textContent;
    const img = e.target.getAttribute("src");

    saveInterestContent({ title, img });
    const genre = findGenreByTitle(title);
    if (genre) saveGenreHistory(genre);
    localStorage.setItem("selectedGenre", currentGenre);

  }
});


renderInterestContents();

// 제목으로 장르 찾기
function findGenreByTitle(title) {
  for (let genre in moviesData) {
    const found = moviesData[genre].find(movie => movie.title === title);
    if (found) return genre;
  }
  return null;
}


function saveGenreHistory(genre) {
  let genreCount = JSON.parse(localStorage.getItem("genreHistory")) || {};

  if (genreCount[genre]) {
    genreCount[genre]++;
  } else {
    genreCount[genre] = 1;
  }

  localStorage.setItem("genreHistory", JSON.stringify(genreCount));
  updatePersonalRecommendation();
}

// 가장 많이 본 장르 계산
function getMostViewedGenre() {
  const genreCount = JSON.parse(localStorage.getItem("genreHistory")) || {};
  let maxGenre = null;
  let maxCount = 0;

  for (let genre in genreCount) {
    if (genreCount[genre] > maxCount) {
      maxCount = genreCount[genre];
      maxGenre = genre;
    }
  }

  return maxGenre;
}

// 맞춤 추천 
function updatePersonalRecommendation() {
  const row = document.getElementById("personalRow");
  const titleEl = document.getElementById("personalTitle");

  if (!row) return;

  const favoriteGenre = getMostViewedGenre();
  if (!favoriteGenre || !moviesData[favoriteGenre]) return;
  titleEl.textContent = `${favoriteGenre.toUpperCase()} 장르를 좋아하는 당신을 위한 맞춤 추천 🎯`;

   const personalTable = titleEl.nextElementSibling; 

  if (personalTable) {
    personalTable.style.backgroundColor =
      genreColors[favoriteGenre] || "#f5f5f5";
    personalTable.style.transition = "background-color 0.4s ease";
  }

  row.innerHTML = "";

  moviesData[favoriteGenre].slice(0, 5).forEach(movie => {
    const card = `
      <div class="ranking-card">
        <a href="#"><img src="${movie.img}" class="movieposter"></a>
        <p class="movietitle">${movie.title}</p>
      </div>
    `;
    row.innerHTML += card;
  });
}

const resetBtn = document.getElementById("resetBtn");

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    const confirmReset = confirm("정말 추천 기록을 초기화할까요?");
    if (!confirmReset) return;

   
    localStorage.removeItem("genreHistory");

    alert("새로운 영화를 추천해드릴게요!");

    
    renderInterestContents();

    const personalRow = document.getElementById("personalRow");
    if (personalRow) personalRow.innerHTML = "";
    const titleEl = document.getElementById("personalTitle");
    if (titleEl) {
      titleEl.textContent = "당신을 위한 맞춤 추천 🎯";
    }
  });
}


let currentIndex = 0;
let currentGenre = "hot"; 

function updateMovies(genre) {
  currentGenre = genre;
  currentIndex = 0;

  renderCurrentRank();
}

function renderCurrentRank() {
  rankingTitle.textContent = `지금의 ${currentGenre.toUpperCase()} 랭킹🔥`;
  rankingRow.innerHTML = "";

  const list = moviesData[currentGenre]; 
  const sliced = list.slice(currentIndex, currentIndex + 5); 

  sliced.forEach(movie => {
    const card = `
      <div class="ranking-card">
        <a href="14_sookplay_page1.html"><img src="${movie.img}" class="movieposter"></a>
        <span class="rank-number">${movie.rank}</span>
        <p class="movietitle">${movie.title}</p>
      </div>
    `;
    rankingRow.innerHTML += card;
  });
}


setInterval(() => {
  const total = moviesData[currentGenre]?.length || 0;
  if (total <= 5) return;

  currentIndex = (currentIndex === 0) ? 5 : 0;
  renderCurrentRank();
}, 4000);


const heroTrack = document.getElementById("heroTrack");
const heroSlides = document.querySelectorAll(".hero-slide");
const heroPrev = document.getElementById("heroPrev");
const heroNext = document.getElementById("heroNext");

let heroIndex = 0;

function moveHeroSlide() {
  heroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;
}


heroNext.addEventListener("click", () => {
  heroIndex = (heroIndex + 1) % heroSlides.length;
  moveHeroSlide();
});


heroPrev.addEventListener("click", () => {
  heroIndex = (heroIndex - 1 + heroSlides.length) % heroSlides.length;
  moveHeroSlide();
});


const searchInput = document.querySelector(".searchInput");
const suggestBox = document.getElementById("suggestBox");


//자동완성 기능
searchInput.addEventListener("input", function () {
  const keyword = searchInput.value.trim().toLowerCase();
  suggestBox.innerHTML = "";

  if (keyword === "") {
    suggestBox.style.display = "none";
    return;
  }

  const matched = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  );

 
  if (matched.length === 0) {
    suggestBox.style.display = "none";
    return;
  }


  matched.forEach(movie => {
    const div = document.createElement("div");
    div.textContent = movie.title;


    div.addEventListener("click", function () {
      location.href = "page2.html";
    });

    suggestBox.appendChild(div);
  });

  suggestBox.style.display = "block";
});



searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();

    const keyword = searchInput.value.trim().toLowerCase();

    const exists = allMovies.some(movie =>
      movie.title.toLowerCase() === (keyword)
    );

    if (!exists) {
      location.href = "14_sookplay_notfound.html"; 
    } else {
      location.href = "14_sookplay_page1.html";
    }
  }
});
