import { MockInstance, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { InMemoryQuestionAttachmentRepository } from 'test/repositories/in-memory-question-attachment-repository';
import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '../use-cases/send-notification';
import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notification-repository';
import { makeQuestion } from 'test/factories/make-question';
import { waitFor } from 'test/utils/wait-for';
import { OnQuestionBestAnswerChosen } from './on-question-best-answer-chosen';

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryQuestionRepository: InMemoryQuestionsRepository;
let inMemoryAnswerAttachmentRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryQuestionAttachmentRepository: InMemoryQuestionAttachmentRepository;
let sendNotificationUseCase: SendNotificationUseCase;
let notificationRepository: InMemoryNotificationRepository;

let sendNotificationExecutionSpy: MockInstance<
  [SendNotificationUseCaseRequest],
  Promise<SendNotificationUseCaseResponse>
>;

describe('On Question Best Answer Chosen', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryQuestionAttachmentRepository =
      new InMemoryQuestionAttachmentRepository();
    inMemoryQuestionRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentRepository,
    );
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentRepository,
    );
    notificationRepository = new InMemoryNotificationRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      notificationRepository,
    );
    sendNotificationExecutionSpy = vi.spyOn(sendNotificationUseCase, 'execute');

    new OnQuestionBestAnswerChosen(
      inMemoryAnswersRepository,
      sendNotificationUseCase,
    );
  });
  it('should send a notification when question has new best answer chosen', async () => {
    const question = makeQuestion();
    const answer = makeAnswer({
      questionId: question.id,
    });

    inMemoryQuestionRepository.create(question);
    inMemoryAnswersRepository.create(answer);

    question.bestAnswerId = answer.id;

    inMemoryQuestionRepository.save(question);

    await waitFor(() => {
      expect(sendNotificationExecutionSpy).toHaveBeenCalled();
    });
  });
});
