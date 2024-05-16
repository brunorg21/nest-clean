import { MockInstance, beforeEach, describe, expect, it, vi } from 'vitest';
import { OnAnswerCreated } from './on-answer-created';
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

describe('On Answer Created', () => {
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

    new OnAnswerCreated(inMemoryQuestionRepository, sendNotificationUseCase);
  });
  it('should send a notification when an answer is created', async () => {
    const question = makeQuestion();
    const answer = makeAnswer({
      questionId: question.id,
    });

    inMemoryQuestionRepository.create(question);
    inMemoryAnswersRepository.create(answer);

    await waitFor(() => {
      expect(sendNotificationExecutionSpy).toHaveBeenCalled();
    });
  });
});
