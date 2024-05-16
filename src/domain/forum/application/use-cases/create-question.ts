import { QuestionRepository } from '../repositories/question-repository';
import { Question } from '../../enterprise/entities/question';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Either, right } from '@/core/either';
import { QuestionAttachment } from '../../enterprise/entities/question-attachment';
import { QuestionAttachmentList } from '../../enterprise/entities/question-attachment-list';
import { Injectable } from '@nestjs/common';

interface CreateQuestionUseCaseRequest {
  authorId: string;
  title: string;
  content: string;
  attachmentsIds: string[];
}
type CreateQuestionUseCaseResponse = Either<
  null,
  {
    question: Question;
  }
>;

@Injectable()
export class CreateQuestionUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({
    authorId,
    content,
    title,
    attachmentsIds,
  }: CreateQuestionUseCaseRequest): Promise<CreateQuestionUseCaseResponse> {
    const question = Question.create({
      authorId: new UniqueEntityId(authorId),
      content,
      title,
    });

    const questionAttachments = attachmentsIds.map((attachmentId) => {
      return QuestionAttachment.create({
        attachmentId: new UniqueEntityId(attachmentId),
        questionId: question.id,
      });
    });
    question.attachments = new QuestionAttachmentList(questionAttachments);

    await this.questionRepository.create(question);

    return right({
      question,
    });
  }
}
