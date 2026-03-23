-- AlterTable
ALTER TABLE "PostReplies" ALTER COLUMN "PostContent" SET DATA TYPE VARCHAR(280);

-- CreateTable
CREATE TABLE "Likes" (
    "likeId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("likeId")
);

-- CreateIndex
CREATE INDEX "Likes_postId_idx" ON "Likes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_userId_postId_key" ON "Likes"("userId", "postId");

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPosts"("postId") ON DELETE CASCADE ON UPDATE CASCADE;
