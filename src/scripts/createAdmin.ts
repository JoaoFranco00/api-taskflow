import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../database/config";

async function main() {
  const nome = process.env.INITIAL_ADMIN_NOME?.trim();
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.INITIAL_ADMIN_PASSWORD;
  if (!nome || !email || !senha || senha.length < 8) {
    throw new Error("Defina INITIAL_ADMIN_NOME, INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD (mínimo 8 caracteres) no .env");
  }
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) throw new Error("Já existe um usuário com esse e-mail; nada foi alterado.");
  await prisma.usuario.create({ data: { nome, email, senhaHash: await bcrypt.hash(senha, 12), papel: "ADMIN" } });
  console.log(`Administrador ${email} criado com sucesso.`);
}
try { await main(); } finally { await prisma.$disconnect(); }
