import "dotenv/config";
import { app } from "./app";
import { prisma } from "./config/prisma";

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

process.on("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
process.on("SIGTERM", async () => { await prisma.$disconnect(); process.exit(0); });