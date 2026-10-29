import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/config";

type Papel = "USER" | "ADMIN";
declare global {
  namespace Express {
    interface Request {
      usuarioAutenticado?: { id: number; papel: Papel };
    }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("Defina JWT_SECRET com pelo menos 32 bytes no arquivo .env");
  }
  return secret;
}

export async function autenticar(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token de autenticação ausente" });
  }
  try {
    const payload = jwt.verify(authorization.slice(7), getJwtSecret());
    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({ erro: "Token inválido" });
    }
    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(401).json({ erro: "Token inválido" });
    }
    const usuario = await prisma.usuario.findUnique({
      where: { id }, select: { id: true, papel: true },
    });
    if (!usuario) return res.status(401).json({ erro: "Usuário não encontrado" });
    req.usuarioAutenticado = usuario;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ erro: "Token inválido ou expirado" });
    }
    return next(error);
  }
}

export function exigirAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.usuarioAutenticado?.papel !== "ADMIN") {
    return res.status(403).json({ erro: "Acesso permitido somente a administradores" });
  }
  return next();
}
