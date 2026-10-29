import { Router } from "express";
import { AuthController } from "../controller/authController";
import { TaskController } from "../controller/taskController";
import { UserController } from "../controller/userController";
import { autenticar, exigirAdmin } from "../middleware/auth";

const routes = Router();
const auth = new AuthController();
const tasks = new TaskController();
const users = new UserController();

routes.post("/auth/register", auth.registrar);
routes.post("/auth/login", auth.login);
routes.get("/tasks", autenticar, tasks.listar);
routes.post("/tasks", autenticar, tasks.criar);
routes.patch("/tasks/:id", autenticar, tasks.atualizar);
routes.delete("/tasks/:id", autenticar, tasks.excluir);
routes.get("/users", autenticar, exigirAdmin, users.listar);

export { routes };
