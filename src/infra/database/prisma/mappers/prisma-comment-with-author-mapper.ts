import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author';
import { Comment as PrismaComment, User as PrismaUser } from '@prisma/client';

type PrismaCommentWithAuthor = PrismaComment & {
  author: PrismaUser;
};

export class PrismaCommentWithAuthorMapper {
  static toDomain(raw: PrismaCommentWithAuthor): CommentWithAuthor {
    return CommentWithAuthor.create({
      commentId: raw.id,
      author: raw.author.name,
      authorId: raw.authorId,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
