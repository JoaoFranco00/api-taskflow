import type { Request, Response } from "express";
import prisma from "../database/config";

export class UserController {
  async listar(_req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        orderBy: { criadoEm: "desc" },
        select: { id: true, nome: true, email: true, papel: true, criadoEm: true },
      });
      return res.json(usuarios);
    } catch { return res.status(500).json({ erro: "Não foi possível listar os usuários" }); }
  }
}
