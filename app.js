const express = require("express");
const axios = require("axios");
const { createClient } = require("redis");

const app = express();

const PORT = 5555;
const API_URL = "https://jsonplaceholder.typicode.com/todos";
const KEY_NAME = "todo_items";
const EXPIRE_IN_SECONDS = 5;

app.get("/todos", async (req, res) => {
  try {
    const redisClient = createClient(6379);
    await redisClient.connect();
    const cached_data = await redisClient.get(KEY_NAME);
    if (!cached_data) {
      const d = await axios.get(API_URL);
      redisClient.setEx(KEY_NAME, EXPIRE_IN_SECONDS, JSON.stringify(d.data));
      return res.status(200).send({
        error: false,
        message: "API response",
        data: d.data,
      });
    } else {
      return res.status(200).send({
        error: false,
        message: "Cached response",
        data: JSON.parse(cached_data),
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
