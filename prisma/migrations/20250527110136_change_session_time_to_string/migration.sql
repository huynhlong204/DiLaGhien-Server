-- DropIndex
DROP INDEX "Session_access_token_key";

-- DropIndex
DROP INDEX "Session_refresh_token_key";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "access_token_expires_at" SET DATA TYPE TEXT,
ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE TEXT,
ALTER COLUMN "is_active" DROP DEFAULT,
ALTER COLUMN "created_at" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TEXT,
ALTER COLUMN "last_used_at" DROP DEFAULT,
ALTER COLUMN "last_used_at" SET DATA TYPE TEXT;
