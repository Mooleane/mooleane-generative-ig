-- AlterTable
ALTER TABLE "published_images" ADD COLUMN     "image_data" BYTEA,
ADD COLUMN     "image_mime" TEXT,
ADD COLUMN     "stored" BOOLEAN NOT NULL DEFAULT false;
