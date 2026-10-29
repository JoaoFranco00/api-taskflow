CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

CREATE TABLE "Usuario" (
  "id" SERIAL NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "papel" "Role" NOT NULL DEFAULT 'USER',
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tarefa" (
  "id" SERIAL NOT NULL,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "usuarioId" INTEGER NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Tarefa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE INDEX "Tarefa_usuarioId_idx" ON "Tarefa"("usuarioId");
