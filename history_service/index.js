const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const PORT = 5001;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, (error) => {
  if (error) {
    console.log("Error starting server");
    return;
  }
  console.log(`History service listening on http://localhost:${PORT}`);
});

const prisma = new PrismaClient();

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
