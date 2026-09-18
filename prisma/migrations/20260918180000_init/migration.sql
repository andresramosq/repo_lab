CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "VoteValue" AS ENUM ('USEFUL', 'NOT_USEFUL');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "username" TEXT NOT NULL, "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL, "image" TEXT, "bio" TEXT, "role" "Role" NOT NULL DEFAULT 'USER',
  "banned" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT NOT NULL
);
CREATE TABLE "Tag" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL);
CREATE TABLE "Post" (
  "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL, "prompt" TEXT NOT NULL, "useCase" TEXT NOT NULL,
  "status" "PostStatus" NOT NULL DEFAULT 'DRAFT', "views" INTEGER NOT NULL DEFAULT 0,
  "authorId" TEXT NOT NULL, "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "PostTag" (
  "postId" TEXT NOT NULL, "tagId" TEXT NOT NULL, PRIMARY KEY ("postId","tagId"),
  CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Vote" (
  "id" TEXT PRIMARY KEY, "value" "VoteValue" NOT NULL, "userId" TEXT NOT NULL, "postId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Favorite" (
  "userId" TEXT NOT NULL, "postId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("userId","postId"),
  CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Favorite_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Comment" (
  "id" TEXT PRIMARY KEY, "body" TEXT NOT NULL, "userId" TEXT NOT NULL, "postId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Report" (
  "id" TEXT PRIMARY KEY, "reason" TEXT NOT NULL, "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  "userId" TEXT NOT NULL, "postId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "Image" (
  "id" TEXT PRIMARY KEY, "url" TEXT NOT NULL, "alt" TEXT, "postId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_status_createdAt_idx" ON "Post"("status","createdAt");
CREATE INDEX "Post_categoryId_status_idx" ON "Post"("categoryId","status");
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX "PostTag_tagId_idx" ON "PostTag"("tagId");
CREATE INDEX "Vote_postId_value_idx" ON "Vote"("postId","value");
CREATE UNIQUE INDEX "Vote_userId_postId_key" ON "Vote"("userId","postId");
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId","createdAt");
CREATE UNIQUE INDEX "Report_userId_postId_key" ON "Report"("userId","postId");

ALTER TABLE "Post" ADD COLUMN "searchVector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('spanish', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('spanish', coalesce("summary", '')), 'B') ||
  setweight(to_tsvector('spanish', coalesce("content", '')), 'C') ||
  setweight(to_tsvector('spanish', coalesce("prompt", '')), 'C')
) STORED;
CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");
