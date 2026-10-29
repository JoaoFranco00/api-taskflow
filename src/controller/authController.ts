import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../database/config";
import { getJwtSecret } from "../middleware/auth";

export class AuthController {
  async registrar(req: Request, res: Response) {
    const { nome, email, senha } = req.body ?? {};
    if (typeof nome !== "string" || !nome.trim() || typeof email !== "string" || !email.trim() ||
        typeof senha !== "string" || senha.length < 8) {
      return res.status(400).json({ erro: "Informe nome, e-mail e senha com pelo menos 8 caracteres" });
    }
    try {
      const usuario = await prisma.usuario.create({
        data: { nome: nome.trim(), email: email.trim().toLowerCase(), senhaHash: await bcrypt.hash(senha, 12), papel: "USER" },
        select: { id: true, nome: true, email: true, papel: true, criadoEm: true },
      });
      return res.status(201).json(usuario);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return res.status(409).json({ erro: "Este e-mail já está cadastrado" });
      }
      return res.status(500).json({ erro: "Não foi possível cadastrar o usuário" });
    }
  }

  async login(req: Request, res: Response) {
    const { email, senha } = req.body ?? {};
    if (typeof email !== "string" || typeof senha !== "string") {
      return res.status(400).json({ erro: "Informe e-mail e senha" });
    }
    try {
      const usuario = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
        return res.status(401).json({ erro: "E-mail ou senha inválidos" });
      }
      const token = jwt.sign({ papel: usuario.papel }, getJwtSecret(), {
        subject: String(usuario.id), expiresIn: "1h",
      });
      return res.json({ token, tipo: "Bearer", expiraEm: "1h", usuario: {
        id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel,
      } });
    } catch {
      return res.status(500).json({ erro: "Não foi possível realizar o login" });
    }
  }
}
