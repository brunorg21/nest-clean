import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '../../enterprise/entities/answer';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Either, right } from '@/core/either';
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment';
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list';
import { Injectable } from '@nestjs/common';

interface AnswerQuestionUseCaseRequest {
  instructorId: string;
  questionId: string;
  attachmentsIds: string[];
  content: string;
}

type AnswerQuestionUseCaseReponse = Either<
  null,
  {
    answer: Answer;
  }
>;

@Injectable()
export class AnswerQuestionUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    instructorId,
    questionId,
    content,
    attachmentsIds,
  }: AnswerQuestionUseCaseRequest): Promise<AnswerQuestionUseCaseReponse> {
    const answer = Answer.create({
      content,
      authorId: new UniqueEntityId(instructorId),
      questionId: new UniqueEntityId(questionId),
    });

    const answerAttachments = attachmentsIds.map((attachmentId) => {
      return AnswerAttachment.create({
        attachmentId: new UniqueEntityId(attachmentId),
        answerId: answer.id,
      });
    });
    answer.attachments = new AnswerAttachmentList(answerAttachments);

    await this.answersRepository.create(answer);

    return right({
      answer,
    });
  }
}
