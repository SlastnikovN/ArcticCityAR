window.onload = () => {
  //Объявление переменных
  let testEntityAdded = false;
  let isMenuOpen = false;
  const el = document.querySelector("[gps-new-camera]");

  //Функция анимации
  const animate = (entity) => {
    let rotation = 0;
    const render = () => {
      rotation = (rotation + 0.5) % 360;
      entity.setAttribute("rotation", `0 ${rotation} 0`);
      requestAnimationFrame(render);
    };
    render();
  };

  ///Массив 3д моделей
    const modelPositions = [
      {
        modelUrl:
          "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%B3%D0%B4%20(1).glb?v=1690298994495",
        latitude: 0,
        longitude: 0,
        info: "Гостиный двор",
        historyId: "historyText1",
        audioUrl:
          "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%93%D0%BE%D1%81%D1%82%D0%B8%D0%BD%D0%BD%D1%8B%D0%B9%20%D0%B4%D0%B2%D0%BE%D1%80.mp3?v=1690300505505",
      },
      {
        modelUrl:
          "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D1%82%D0%B5%D0%B0%D1%82%D1%80%20(1).glb?v=1690298990378",
        latitude: 1,
        longitude: 1,
        info: "Театр драмы имени М.В Ломоносова",
        historyId: "historyText2",
        audioUrl:
          "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%A2%D0%B5%D0%B0%D1%82%D1%80.mp3?v=1690300502229",
      },
      {
        modelUrl:
          "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D1%86%D0%B5%D1%80%D0%BA%D0%BE%D0%B2%D1%8C.glb?v=1690289747435",
        latitude: 2,
        longitude: 2,
        info: "Церковь Святой Екатерины",
        historyId: "historyText3",
        audioUrl:
          "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%A6%D0%B5%D1%80%D0%BA%D0%BE%D0%B2%D1%8C.mp3?v=1690300504219",
      },
    ];
  
  
  //Получение координат местоположения пользователя
  el.addEventListener("gps-camera-update-position", (e) => {
    // Обновление позиций в массиве моделей
    modelPositions[0].latitude = e.detail.position.latitude - 0.0004;
    modelPositions[0].longitude = e.detail.position.longitude;
    modelPositions[1].latitude = e.detail.position.latitude + 0.0002;
    modelPositions[1].longitude = e.detail.position.longitude;
    modelPositions[2].latitude = e.detail.position.latitude;
    modelPositions[2].longitude = e.detail.position.longitude - 0.0001;

    if (!testEntityAdded) {
      const scene = document.querySelector("a-scene");
      
      //Цикл обработки 3д моделей
      modelPositions.forEach((position) => {
        const entity = document.createElement("a-entity");
        entity.setAttribute("gltf-model", position.modelUrl);
        entity.dataset.info = position.info;
        entity.dataset.historyId = position.historyId;
        entity.setAttribute("scale", "0.3 0.3 0.3");
        entity.setAttribute("gps-new-entity-place", {
          latitude: position.latitude,
          longitude: position.longitude,
        });

        //Запуск анимации
        animate(entity);

        // Обработчик клика по 3D модели
        entity.addEventListener("click", function () {
          //Нажатие на 3д модель и вывод название данного объекта
          const div = document.querySelector(".main");
          div.innerText = this.dataset.info;

          //В зависимости от выбранной модели показывается текст исторической справки
          const historyBlocks = document.querySelectorAll(".historyText");

          historyBlocks.forEach((block) => {
            if (block.id === this.dataset.historyId) {
              block.style.display = "block";
            } else {
              block.style.display = "none";
            }
          });

          // Установка аудио источника
          let isPlaying = false;
          let pausedTime = 0;
          const audioPlayer = document.getElementById("audioPlayer");
          const soundElement = document.querySelector(".soundHistory");
          soundElement.addEventListener("click", function () {
            if (isPlaying) {
              pausedTime = audioPlayer.currentTime;
              audioPlayer.pause();
              isPlaying = false;
            } else {
              if (!audioPlayer.src || audioPlayer.src !== position.audioUrl) {
                audioPlayer.src = position.audioUrl;
              }
              audioPlayer.currentTime = pausedTime;
              audioPlayer.play();
              isPlaying = true;
            }
          });

          // Обработчик события "pause" аудио элемента
          audioPlayer.addEventListener("pause", function () {
            isPlaying = false;
          });

          // Обработчик события "ended" аудио элемента
          audioPlayer.addEventListener("ended", function () {
            isPlaying = false;
          });
        });
        scene.appendChild(entity);
       
      });
      testEntityAdded = true;
    }
  });

  //Обработчик нажатия на кнопку меню
  document.getElementById("btnRight").addEventListener("click", function () {
    var menuRight = document.getElementById("menuRight");
    if (isMenuOpen) {
      menuRight.style.display = "block";
    menuRight.style.transform = 'translateX(100%)';
  } else {
    menuRight.style.transform = 'translateX(0)';
  }
  
  isMenuOpen = !isMenuOpen;
    
    
  });

  //Обработчик нажатия на кнопку "Историческая справка"\
  document.getElementById("p2").addEventListener("click", function () {
    var history = document.getElementById("history");
    
    history.style.display = "block";
    var main = document.querySelector(".main");
    main.style.display = "none";
    
  });

  //Обработчик нажатия на кнопку "Выйти с исторической справки"
  document
    .getElementById("deleteHistory")
    .addEventListener("click", function () {
      var history = document.getElementById("history");
      const audioPlayer = document.getElementById("audioPlayer");
    var menuRight = document.getElementById("menuRight");
    
      history.style.display = "none";
      var main = document.querySelector(".main");
      main.style.display = "flex";
    menuRight.style.display = "none";

      //Отключение звука
      audioPlayer.currentTime = 0;
      audioPlayer.pause();
   
    });
};
