-- CreateTable
CREATE TABLE "FeedPosts" (
    "postId" SERIAL NOT NULL,
    "postContent" VARCHAR(45) NOT NULL,
    "postDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "User_userId" INTEGER NOT NULL,

    CONSTRAINT "FeedPosts_pkey" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "PostReplies" (
    "postId" SERIAL NOT NULL,
    "PostContent" VARCHAR(45) NOT NULL,
    "RepliedPostDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MainPosts_postId" INTEGER NOT NULL,

    CONSTRAINT "PostReplies_pkey" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "Users" (
    "userId" SERIAL NOT NULL,
    "name" VARCHAR(45) NOT NULL,
    "lastname" VARCHAR(45) NOT NULL,
    "username" VARCHAR(45) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "fk_MainPosts_User_idx" ON "FeedPosts"("User_userId");

-- CreateIndex
CREATE INDEX "fk_RepliedPosts_MainPosts1_idx" ON "PostReplies"("MainPosts_postId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "FeedPosts" ADD CONSTRAINT "fk_MainPosts_User" FOREIGN KEY ("User_userId") REFERENCES "Users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PostReplies" ADD CONSTRAINT "fk_RepliedPosts_MainPosts1" FOREIGN KEY ("MainPosts_postId") REFERENCES "FeedPosts"("postId") ON DELETE NO ACTION ON UPDATE NO ACTION;
