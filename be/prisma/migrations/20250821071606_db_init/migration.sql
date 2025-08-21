-- CreateTable
CREATE TABLE "public"."Photos" (
    "id" SERIAL NOT NULL,
    "photo_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photos_pkey" PRIMARY KEY ("id")
);
