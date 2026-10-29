import type { Request, Response } from "express";
import prisma from "../database/config";

const statusValidos = ["PENDING", "IN_PROGRESS", "DONE"] as const;

export class TaskController {
  async listar(req: Request, res: Response) {
    const usuario = req.usuarioAutenticado!;
    try {
      const tarefas = await prisma.tarefa.findMany({
        where: usuario.papel === "ADMIN" ? {} : { usuarioId: usuario.id },
        orderBy: { criadoEm: "desc" },
        select: { id: true, titulo: true, descricao: true, status: true, usuarioId: true, criadoEm: true, atualizadoEm: true },
      });
      return res.json(tarefas);
    } catch { return res.status(500).json({ erro: "Não foi possível listar as tarefas" }); }
  }

  async criar(req: Request, res: Response) {
    const { titulo, descricao } = req.body ?? {};
    if (typeof titulo !== "string" || !titulo.trim()) {
      return res.status(400).json({ erro: "O título da tarefa é obrigatório" });
    }
    if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
      return res.status(400).json({ erro: "A descrição deve ser um texto" });
    }
    try {
      const tarefa = await prisma.tarefa.create({ data: {
        titulo: titulo.trim(), descricao: typeof descricao === "string" ? descricao.trim() || null : null,
        usuarioId: req.usuarioAutenticado!.id,
      } });
      return res.status(201).json(tarefa);
    } catch { return res.status(500).json({ erro: "Não foi possível criar a tarefa" }); }
  }

  async atualizar(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { titulo, descricao, status } = req.body ?? {};
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ erro: "ID de tarefa inválido" });
    if (titulo === undefined && descricao === undefined && status === undefined) {
      return res.status(400).json({ erro: "Informe ao menos um campo para atualizar" });
    }
    if (titulo !== undefined && (typeof titulo !== "string" || !titulo.trim())) {
      return res.status(400).json({ erro: "O título não pode ser vazio" });
    }
    if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
      return res.status(400).json({ erro: "A descrição deve ser um texto" });
    }
    if (status !== undefined && !statusValidos.includes(status)) {
      return res.status(400).json({ erro: "Status deve ser PENDING, IN_PROGRESS ou DONE" });
    }
    try {
      const existente = await prisma.tarefa.findUnique({ where: { id } });
      if (!existente) return res.status(404).json({ erro: "Tarefa não encontrada" });
      const autenticado = req.usuarioAutenticado!;
      if (autenticado.papel !== "ADMIN" && existente.usuarioId !== autenticado.id) {
        return res.status(403).json({ erro: "Você só pode alterar suas próprias tarefas" });
      }
      const tarefa = await prisma.tarefa.update({ where: { id }, data: {
        ...(titulo !== undefined ? { titulo: titulo.trim() } : {}),
        ...(descricao !== undefined ? { descricao: typeof descricao === "string" ? descricao.trim() || null : null } : {}),
        ...(status !== undefined ? { status } : {}),
      } });
      return res.json(tarefa);
    } catch { return res.status(500).json({ erro: "Não foi possível atualizar a tarefa" }); }
  }

  async excluir(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ erro: "ID de tarefa inválido" });
    try {
      const tarefa = await prisma.tarefa.findUnique({ where: { id } });
      if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
      const autenticado = req.usuarioAutenticado!;
      if (autenticado.papel !== "ADMIN" && tarefa.usuarioId !== autenticado.id) {
        return res.status(403).json({ erro: "Você só pode excluir suas próprias tarefas" });
      }
      await prisma.tarefa.delete({ where: { id } });
      return res.status(204).send();
    } catch { return res.status(500).json({ erro: "Não foi possível excluir a tarefa" }); }
  }
}
