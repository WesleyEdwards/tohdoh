import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { engine } from "express-handlebars";
import { tokenController } from "./controllers/token_controller";
import { usersController } from "./controllers/user_controller";
import { eventSchedulerController } from "./controllers/eventScheduler_controller";
import { scheduleController } from "./controllers/schedule_controller";

dotenv.config();
const client = new PrismaClient();
const app = express();
app.use(express.json());
app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/views"));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    if (req.path.match(/\.\w+$/)) {
      // does the path end with a file extension
      fetch(`${process.env.assetUrl}/${req.path}`).then((response) => {
        if (response.ok) {
          res.redirect(response.url); // Check to see if what we want is at the asset url, then redirect if it is.
        } else {
          // Handle Dev problems here
        }
      });
    } else {
      next();
    }
  });
} else {
  // Do prod things
}

usersController(app, client);
tokenController(app, client);
eventSchedulerController(app, client);
scheduleController(app, client);

app.get("/*", (req, res) => {
  console.log("root");
  res.render("app", {
    development: process.env.debug?.toLowerCase() === "true",
    assetUrl: process.env.assetUrl,
  });
});

const port = parseInt(process.env.PORT ?? "3000");
app.listen(port, () => {
  console.log(`Listening on port:${port}`);
});
