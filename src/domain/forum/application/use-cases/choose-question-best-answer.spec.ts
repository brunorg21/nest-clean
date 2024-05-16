import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';

import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { makeQuestion } from 'test/factories/make-question';
import { NotAllowedError } from '../../../../core/errors/errors/not-allowed-error';
import { InMemoryQuestionAttachmentRepository } from 'test/repositories/in-memory-question-attachment-repository';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachment-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: ChooseQuestionBestAnswerUseCase;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentRepository;

describe('Choose Best Answer ', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    );
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    );
    sut = new ChooseQuestionBestAnswerUseCase(
      inMemoryAnswersRepository,
      inMemoryQuestionsRepository,
    );
  });

  it('should be able to choose the question best answer', async () => {
    const newQuestion = makeQuestion();

    const newAnswer = makeAnswer({
      questionId: newQuestion.id,
    });

    await inMemoryQuestionsRepository.create(newQuestion);
    await inMemoryAnswersRepository.create(newAnswer);

    await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: newQuestion.authorId.toString(),
    });

    expect(inMemoryQuestionsRepository.items[0].bestAnswerId).toEqual(
      newAnswer.id,
    );
  });
  it('should not be able to choose another user question best answer', async () => {
    const newQuestion = makeQuestion({
      authorId: new UniqueEntityId('author-1'),
    });

    const newAnswer = makeAnswer({
      questionId: newQuestion.id,
    });

    await inMemoryQuestionsRepository.create(newQuestion);
    await inMemoryAnswersRepository.create(newAnswer);

    const result = await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: 'author-2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
