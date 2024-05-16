import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment';
import { Comment as PrismaComment, Prisma } from '@prisma/client';

export class PrismaAnswerCommentMapper {
  static toDomain(raw: PrismaComment): AnswerComment {
    if (!raw.answerId) {
      throw new Error('Invalid comment type');
    }

    return AnswerComment.create(
      {
        authorId: new UniqueEntityId(raw.authorId),
        content: raw.content,
        answerId: new UniqueEntityId(raw.answerId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(
    answerComment: AnswerComment,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      id: answerComment.id.toString(),
      authorId: answerComment.authorId.toString(),
      content: answerComment.content,
      createdAt: answerComment.createdAt,
      updatedAt: answerComment.updatedAt,
      answerId: answerComment.answerId.toString(),
    };
  }
}
