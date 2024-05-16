import { QuestionRepository } from '../repositories/question-repository';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { QuestionComment } from '../../enterprise/entities/question-comment';
import { QuestionCommentsRepository } from '../repositories/question-comments-repository';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '../../../../core/errors/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';

interface CommentOnQuestionUseCaseRequest {
  authorId: string;
  questionId: string;
  content: string;
}
type CommentOnQuestionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    questionComment: QuestionComment;
  }
>;

@Injectable()
export class CommentOnQuestionUseCase {
  constructor(
    private questionRepository: QuestionRepository,
    private questionCommentsRepository: QuestionCommentsRepository,
  ) {}

  async execute({
    authorId,
    content,
    questionId,
  }: CommentOnQuestionUseCaseRequest): Promise<CommentOnQuestionUseCaseResponse> {
    const question = await this.questionRepository.findById(questionId);

    if (!question) {
      return left(new ResourceNotFoundError());
    }

    const questionComment = QuestionComment.create({
      authorId: new UniqueEntityId(authorId),
      content,
      questionId: new UniqueEntityId(questionId),
    });

    await this.questionCommentsRepository.create(questionComment);

    return right({
      questionComment,
    });
  }
}
