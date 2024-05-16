import { Either, left, right } from '@/core/either';
import { Answer } from '../../enterprise/entities/answer';

import { AnswersRepository } from '../repositories/answers-repository';
import { ResourceNotFoundError } from '../../../../core/errors/errors/resource-not-found-error';
import { NotAllowedError } from '../../../../core/errors/errors/not-allowed-error';
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment';
import { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository';
import { Injectable } from '@nestjs/common';

interface EditAnswerUseCaseRequest {
  authorId: string;
  answerId: string;
  content: string;
  attachmentsIds: string[];
}
type EditAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    answer: Answer;
  }
>;

@Injectable()
export class EditAnswerUseCase {
  constructor(
    private answerRepository: AnswersRepository,
    private answerAttachmentsReposiotry: AnswerAttachmentsRepository,
  ) {}

  async execute({
    authorId,
    answerId,
    content,
    attachmentsIds,
  }: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
    const answer = await this.answerRepository.findById(answerId);

    if (!answer) {
      return left(new ResourceNotFoundError());
    }

    if (authorId !== answer.authorId.toString()) {
      return left(new NotAllowedError());
    }

    const currentAnswerAttachments =
      await this.answerAttachmentsReposiotry.findManyByAnswerId(answerId);

    const answerAttachmentList = new AnswerAttachmentList(
      currentAnswerAttachments,
    );

    const answerAttachments = attachmentsIds.map((attachmentId) => {
      return AnswerAttachment.create({
        attachmentId: new UniqueEntityId(attachmentId),
        answerId: answer.id,
      });
    });

    answerAttachmentList.update(answerAttachments);

    answer.attachments = answerAttachmentList;

    answer.content = content;

    await this.answerRepository.save(answer);

    return right({
      answer,
    });
  }
}
