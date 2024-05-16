import { beforeEach, describe, expect, it } from 'vitest';
import { AnswerQuestionUseCase } from './answer-question';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerAttachmentRepository: InMemoryAnswerAttachmentsRepository;
let sut: AnswerQuestionUseCase;

describe('Create Answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentRepository,
    );
    sut = new AnswerQuestionUseCase(inMemoryAnswersRepository);
  });

  it('should be able to create a answer', async () => {
    const result = await sut.execute({
      content: 'Bruno',
      instructorId: '1',
      questionId: '1',
      attachmentsIds: ['1', '2'],
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryAnswersRepository.items[0]).toEqual(result.value?.answer);
    expect(
      inMemoryAnswersRepository.items[0].attachments.currentItems,
    ).toHaveLength(2);
    expect(inMemoryAnswersRepository.items[0].attachments.currentItems).toEqual(
      [
        expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityId('2') }),
      ],
    );
  });
});
