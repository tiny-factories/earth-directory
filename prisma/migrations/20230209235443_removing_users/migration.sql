/*
  Warnings:

  - You are about to drop the column `userId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Term` table. All the data in the column will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationtokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- DropForeignKey
ALTER TABLE "Term" DROP CONSTRAINT "Term_authorId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Term" DROP COLUMN "authorId";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "verificationtokens";
