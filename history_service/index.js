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
      // const msg = JSON.parse(data.content.toString());
      // emitter.emit(msg.event, msg);
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

app.listen(PORT, (error) => {
  if (error) {
    console.log("Error starting server");
    return;
  }
  console.log(`History service listening on http://localhost:${PORT}`);
});

async function main() {
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
