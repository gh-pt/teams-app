-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN     "lastReadAt" TIMESTAMP(3),
ADD COLUMN     "unreadCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "readAt" TIMESTAMP(3);
