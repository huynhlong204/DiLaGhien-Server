-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "password_hash" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
