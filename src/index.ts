import { app, io, server } from "./server";
import { client, status } from "./wa";
import { ensureDatabaseSetup } from "./services/database";
import * as dotenv from "dotenv";


import {
  indexRouteHandler,
  sendRouteHandler,
  broadCastRouteHandler,
} from "./routeHandlers";

dotenv.config();




(async () => {
  try {
      console.log("Setting up the database...");
      await ensureDatabaseSetup(); 
      console.log("Database is ready!");

      client.initialize();
  } catch (error) {
      console.error("Failed to initialize application:", error);
  }
})();

io.on("connection", () => {
  io.emit("status", status);
});

app.get("/", indexRouteHandler);
app.post("/send", sendRouteHandler);
app.post("/broadcast", broadCastRouteHandler);

// listen on port 3000
server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
