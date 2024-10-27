import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import client from "prom-client";

const app = express();
const port = 8181;

app.use(express.json());
app.use(cors());

// Criando as métricas
const onlineUsers = new client.Gauge({
  name: "nodeapp_online_users",
  help: "Online Users",
  labelNames: ["course"],
});

const httpRequestsTotal = new client.Counter({
  name: "nodeapp_http_requests_total",
  help: "Count of all HTTP requests for nodeapp",
});

const httpDuration = new client.Histogram({
  name: "nodeapp_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["handler"],
});

client.register.registerMetric(onlineUsers);
client.register.registerMetric(httpRequestsTotal);
client.register.registerMetric(httpDuration);

setInterval(() => {
  onlineUsers.set(Math.floor(Math.random() * 2000));
}, 5000);

const trackDuration = (handler: string, res: Response) => {
  const end = httpDuration.startTimer({ handler });
  res.on("finish", () => {
    end();
    httpRequestsTotal.inc();
  });
};

app.use((err: Error, req: Request, res: Response, next: NextFunction): any => {
  if (err instanceof Error) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

app.get("/", (req: Request, res: Response) => {
  trackDuration("home", res);
  setTimeout(() => {
    res.status(200).send("Servidor Node rodando na porta 8181!");
  }, Math.floor(Math.random() * 3000));
});

app.get("/contact", (req: Request, res: Response) => {
  trackDuration("contact", res);
  setTimeout(() => {
    res.status(200).send("Contact");
  }, Math.floor(Math.random() * 2000));
});

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

const server = app.listen(port, () => {
  console.log(`http://localhost:${port} 🔥🔥🚒 `);
});
