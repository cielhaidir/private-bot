import axios from "axios";
import { insertToJournal } from "../services/database";
import { parseMessage } from "../services/llm";

export async function handleCatatCommand(msg: any) {
  msg.reply("Mode pencatatan aktif. Kirim detail pengeluaran/pemasukan.");
}

export async function handleCatatMode(msg: any) {
  try {
    const response = await parseMessage(msg.body);
    console.log("Parsed message:", response);
    const data = response; 
    for (const row of data) {
      const { type, total, desc } = row;
      await insertToJournal(type, total, desc);
    }

    msg.reply(`Data berhasil dicatat:\n${data.map(row => `${row.type}, ${row.total}, ${row.desc}`).join("\n")}`);
  } catch (error) {
    console.error("Error parsing message:", error);
    msg.reply("Terjadi kesalahan saat memproses pesan. Coba lagi.");
  }
}
