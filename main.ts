import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { routes } from "./src/routes/routes";
import { getJwtSecret } from "./src/middleware/auth";

getJwtSecret();
const app = express();
const port = Number(process.env.PORT) || 5000;
app.use(cors());
app.use(express.json());
app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok", api: "TaskFlow API" }));
app.use(routes);
app.use((_req: Request, res: Response) => res.status(404).json({ erro: "Rota não encontrada" }));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  return res.status(500).json({ erro: "Erro interno do servidor" });
});
app.listen(port, () => console.log(`TaskFlow API rodando em http://localhost:${port}`));
