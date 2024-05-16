import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository';

import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment';
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author';
import { InMemoryStudentsRepository } from './in-memory-student-repository';

export class InMemoryAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  constructor(private studentsRepository: InMemoryStudentsRepository) {}

  public items: AnswerComment[] = [];

  async create(answerComment: AnswerComment): Promise<void> {
    this.items.push(answerComment);
  }

  async findById(answerId: string): Promise<AnswerComment | null> {
    const answerComment = this.items.find(
      (answerComment) => answerComment.id.toString() === answerId,
    );

    if (!answerComment) {
      return null;
    }

    return answerComment;
  }

  async findManyByAnswerId(
    answerId: string,
    { page }: PaginationParams,
  ): Promise<AnswerComment[]> {
    const questionComments = this.items
      .filter((item) => item.answerId.toString() === answerId)
      .slice((page - 1) * 20, page * 20);

    return questionComments;
  }

  async delete(answerComment: AnswerComment): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === answerComment.id,
    );

    this.items.splice(itemIndex, 1);
  }

  async findManyByAnswerIdWithAuthor(
    answerId: string,
    { page }: PaginationParams,
  ): Promise<CommentWithAuthor[]> {
    const answerComments = this.items
      .filter((item) => item.answerId.toString() === answerId)
      .slice((page - 1) * 20, page * 20)
      .map((comment) => {
        const author = this.studentsRepository.items.find((student) => {
          return student.id.equals(comment.authorId);
        });

        if (!author) {
          throw new Error(
            `Author with ID ${comment.authorId.toString()} does not exist.`,
          );
        }

        return CommentWithAuthor.create({
          authorId: comment.authorId.toString(),
          commentId: comment.id.toString(),
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          content: comment.content,
          author: author.name,
        });
      });

    return answerComments;
  }
}
