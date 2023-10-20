const express = require("express");
const EventEmitter = require("events");
const amqp = require("amqplib");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const app = express();
const PORT = parseInt(process.env.PORT) || 5001;

app.use(express.json());

const emitter = new EventEmitter();
var channel, connection;
const amqp_url = process.env.AMQP_URL;

connectQueue();
async function connectQueue() {
  try {
    connection = await amqp.connect(amqp_url);
    channel = await connection.createChannel();
    await channel.consume("actions", (data) => {
      const action = JSON.parse(data.content);
      emitter.emit("action", action);
      channel.ack(data);
    });
    process.on("beforeExit", () => {
      console.log("closing");
      channel.close();
      connection.close();
    });
  } catch (error) {
    console.log(error);
  }
}

emitter.on("action", async (action) => {
  const history = await prisma.history.create({
    data: { ...action.data },
  });
  console.log(history);
});

app.listen(PORT, (error) => {
  if (error) {
    console.log("Error starting server");
    return;
  }
  console.log(`History service listening on http://localhost:${PORT}`);
});

app.get("/history/page/:page", async (req, res) => {
  try {
    const query = req.query;
    const page = parseInt(req.params.page) || 1;
    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ message: "Invalid page parameter" });
    }

    const limit = parseInt(query.limit) || 2;
    if (limit <= 0 || !Number.isInteger(limit)) {
      return res.status(400).json({ message: "Invalid limit parameter" });
    }

    const validSorts = ["asc", "desc"];
    const sort = validSorts.includes(query.sort) ? query.sort : "desc";

    const user = parseInt(query.user);
    const where = user ? { user_id: user } : {};

    const history_chunk = await prisma.history.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: sort,
      },
      where,
    });

    const count = await prisma.history.count({ where });
    const maxPage = Math.ceil(count / limit);
    if (page > maxPage) {
      return res.status(400).json({ message: "Page out of bounds" });
    }

    const result = {
      data: history_chunk,
      maxPage: maxPage,
      currentPage: page,
      nextPage: page < maxPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
});
