// server.js
// where your node app starts

// init project
var express = require("express");
var Sequelize = require("sequelize");
const app = express();
var fs = require("fs");

// default user list
const BName = [["Гостинный двор"], ["Театр"], ["Церковь"]];

const AudioURL = [
  [
    "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%93%D0%BE%D1%81%D1%82%D0%B8%D0%BD%D0%BD%D1%8B%D0%B9%20%D0%B4%D0%B2%D0%BE%D1%80.mp3?v=1690300505505",
  ],
  [
    "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%A2%D0%B5%D0%B0%D1%82%D1%80.mp3?v=1690300502229",
  ],
  [
    "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%A6%D0%B5%D1%80%D0%BA%D0%BE%D0%B2%D1%8C.mp3?v=1690300504219",
  ],
];
const ModelURL = [
  [
    "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D0%B3%D0%B4%20(1).glb?v=1690298994495",
  ],
  [
    "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D1%82%D0%B5%D0%B0%D1%82%D1%80%20(1).glb?v=1690298990378",
  ],
  [
    "https://cdn.glitch.global/8a9619f7-6855-49e4-8aae-e830518f9958/%D1%86%D0%B5%D1%80%D0%BA%D0%BE%D0%B2%D1%8C.glb?v=1690289747435",
  ],
];
var ARapp;
var Audio;
var Model;

// Подключение статических файлов, включая CSS
app.use(express.static("public")); // Замените 'public' на путь к вашим статическим файлам

// setup a new database
// using database credentials set in .env
var sequelize = new Sequelize(
  "database",
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: "0.0.0.0",
    dialect: "sqlite",
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
    // Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
    storage: ".data/database.sqlite",
  }
);

// authenticate with the database
sequelize
  .authenticate()
  .then(function (err) {
    console.log("Connection has been established successfully.");
    // define a new table 'ARapp'
    ARapp = sequelize.define("ARapp", {
      BildName: {
        type: Sequelize.STRING,
      },
      Model: {
        type: Sequelize.STRING,
      },
      Audio: {
        type: Sequelize.STRING,
      },
      latitude: {
        type: Sequelize.FLOAT,
      },
      longitude: {
        type: Sequelize.FLOAT,
      },
    });

    // синхронизация базы данных с определением модели
    return sequelize.sync();
  })
  .then(function () {
    console.log("Database synchronized successfully.");
    setup(); // Вызываем функцию setup после синхронизации базы данных
  })
  .catch(function (err) {
    console.log("Unable to connect to the database: ", err);
  });

// Обработка AJAX-запроса для сохранения местоположения в базу данных
app.post("/users", function (request, response) {
  const { latitude, longitude } = request.body;
  
  // Здесь можно выполнить код для сохранения данных в базу данных
  // Например, используя вашу модель ARapp

  ARapp.create({ latitude, longitude })
    .then(() => {
      console.log("Местоположение успешно сохранено в базе данных.");
      response.json({ success: true }); // Отправить успешный статус обратно на клиент
    })
    .catch((error) => {
      console.error(
        "Ошибка при сохранении местоположения в базе данных:",
        error
      );
      response.sendStatus(500); // Отправить статус ошибки обратно на клиент
    });
});

// populate table with default data
function setup() {
  ARapp.sync({ force: true })
    .then(function () {
      const records = [];
      for (let i = 0; i < ModelURL.length; i++) {
        records.push({
          BildName: BName[i][0],
          Audio: AudioURL[i][0],
          Model: ModelURL[i][0],
        });
      }
      console.log("Records to be inserted:", records); // Выводим записи перед добавлением

      return ARapp.bulkCreate(records);
    })
    .then(() => {
      console.log("Default data has been inserted into the ARapp table.");
    })
    .catch(function (err) {
      console.log("Error inserting default data: ", err);
    });
}

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get("/users", function (request, response) {
  ARapp.findAll().then(function (Arapps) {
    const dbUsers = Arapps.map((arapp) => ({
      BildName: arapp.BildName,
      Audio: arapp.Audio,
      Model: arapp.Model,
      latitude: arapp.latitude,
      longitude: arapp.longitude,
    }));

    response.json(dbUsers); // sends dbUsers back to the page as JSON
  });
});

app.post("/users", function (request, response) {
  ARapp.create({
    BildName: request.body.bName,
    Model: request.body.mURL,
    Audio: request.body.aURL,
    latitude: request.body.latitude,
    longitude: request.body.longitude,
  })
  .then(() => {
    console.log("Запись успешно добавлена в таблицу ARapp.");
    response.sendStatus(200);
  })
  .catch((error) => {
    console.error("Ошибка при добавлении записи в таблицу ARapp:", error);
    response.sendStatus(500);
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
