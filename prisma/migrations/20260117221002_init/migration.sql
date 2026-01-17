-- CreateTable
CREATE TABLE "published_images" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "hearts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "published_images_pkey" PRIMARY KEY ("id")
);
