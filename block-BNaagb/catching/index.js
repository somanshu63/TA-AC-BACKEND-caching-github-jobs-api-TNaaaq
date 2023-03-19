var express = require("express");
var app = express();
var axios = require("axios");
var redis = require("redis");

var client = redis.createClient(6379);
(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("Redis Connected"));
client.on("error", (err) => console.log(err));

var starWarsURL = "https://swapi.dev/api/";

app.get("/", (req, res) => {
  res.send("<h2>catching</h2>");
});

var checkCache = (req, res, next) => {
  var char = req.query.char;
  client.get(char, (err, data) => {
    if (err) throw err;
    if (!data) return next();
    res.json({ character: JSON.parse(data), info: "retrieved from redis" });
  });
};

app.get("/characters", checkCache, async (req, res) => {
  var char = req.query.char;
  var character = await axios.get(starWarsURL + char);
  client.setEx(char, 600, JSON.stringify(character.data));
  res.json({ character: character.data, info: "retrieved from server" });
});

app.listen(3000, () => {
  console.log("listening @ port 3000");
});
