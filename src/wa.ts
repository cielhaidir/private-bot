import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";
import { io } from "./server";
import config from "../config";


import { handleBudgetCommand, handleSetBudgetCommand } from "./modules/budget";
import { handleCatatCommand, handleCatatMode } from "./modules/catat";


let currentMode: "default" | "catat" = "default";




export let qrBase64: string | null = null;
export let status: "ready" | "pending" | "unauthenticated" | "authenticated" =
  "pending";

const wwebVersion = "2.2412.54";

export const client = new Client({
  // authStrategy: new LocalAuth({ clientId: config.sessionName || "my-session" }),
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  webVersionCache: {
    type: "remote",
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
},
});

client.on("qr", async (qr) => {
  status = "unauthenticated";
  qrBase64 = await qrcode.toDataURL(qr);

  io.emit("status", status);
  io.emit("qr", qrBase64);
});

client.on("authenticated", (session) => {
  status = "authenticated";
  io.emit("status", status);
  io.emit("session", session);
});

client.on("ready", () => {
  status = "ready";
  io.emit("status", status);
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (msg.id.fromMe) return;

  if (msg.body === "!catat") {
    currentMode = "catat";
    await handleCatatCommand(msg);
    return;
  }

  if (msg.body === "!budget") {
    await handleBudgetCommand(msg);
    return;
  }

  if (msg.body.startsWith("!setBudget")) {
    await handleSetBudgetCommand(msg);
    return;
  }

  // Mode-Specific Handling
  if (currentMode === "catat" && msg.body && !msg.body.startsWith("!")) {
    await handleCatatMode(msg);
    return;
  }

  msg.reply(
    "Perintah tidak dikenal. Gunakan:\n!catat - Pencatatan keluar/masuk\n!budget - Info budget mingguan\n!setBudget <nominal> - Atur budget mingguan"
  );
});