const express = require("express");
const EventEmitter = require("events");
const amqp = require("amqplib");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = 5001;

app.use(express.json());

const emitter = new EventEmitter();
var channel, connection;

connectQueue();
async function connectQueue() {
  try {
    connection = await amqp.connect(
      "amqps://mombwlwf:ST-l0O31nJnPfzAyuYc1iVyvV0Ns510y@cow.rmq2.cloudamqp.com/mombwlwf"
    );
    channel = await connection.createChannel();
    await channel.consume("actions", (data) => {
      console.log(`Received ${Buffer.from(data.content)}`);
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
    const page = parseInt(req.params.page);
    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ message: "Invalid page parameter" });
    }

    let limit = parseInt(req.query.limit);
    if (!limit || limit <= 0 || !Number.isInteger(limit)) {
      return res.status(400).json({ message: "Invalid limit parameter" });
    }

    const count = await prisma.history.count();
    const maxPage = Math.ceil(count / limit);
    if (page > maxPage) {
      return res.status(400).json({ message: "Page out of bounds" });
    }

    const history_chunk = await prisma.history.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
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
