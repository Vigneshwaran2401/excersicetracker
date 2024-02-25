const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const users = [];
const logs = [];
app.post("/api/users", (request, response) => {
  let username = request.body.username;
  let _id = uuidv4();
  users.push({ _id, username });
  response.json({ _id, username });
});

app.post("/api/users/:id/exercises", (request, response) => {
  let _id = request.params.id;
  let username = getUsername(_id);
  let description = request.body.description;
  let duration = request.body.duration;
  let date = getDate(request.body.date);
  logs.push({ _id, description, duration, date });
  response.json({ _id, username, description, duration, date });
});

app.get("/api/users/:_id/logs", (request, response) => {
  let _id = request.params._id;

  let from = request.query.from;
  let to = request.query.to;
  let limit = request.query.limit;
  response.json({
    username: getUsername(_id),
    count: getLogs(_id).length,
    _id,
    log: getLogs(_id, from, to, limit),
  });
});

const getLogs = (id, from, to, limit) => {
  let newLog = [];
  let len = limit ? limit : logs.length;
  let isFrom = from ? new Date(from).getTime() : new Date(0).getTime();
  let isTo = to ? new Date(to).getTime() : new Date().getTime();
  for (let i = 0; i < len; i++) {
    if (logs[i]["_id"] === id) {
      if (isRangeDate(isFrom, isTo, logs[i].date)) {
        newLog.push({
          description: logs[i]["description"],
          duration: logs[i].duration,
          date: logs[i].date,
        });
      }
    }
  }
  return newLog;
};

const isRangeDate = (from, to, date) => {
  return new Date(date).getTime() > from && new Date(date).getTime() < to
    ? true
    : false;
};

const getUsername = (id) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i]["_id"] === id) {
      return users[i].username;
    }
  }
  return null;
};

const getDate = (dat) => {
  let options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return new Date(dat).toLocaleDateString("en-US", options).replaceAll(",", "");
};

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
