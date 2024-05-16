import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { FetchRecentQuestionsUseCase } from './fetch-recent-questions';

import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionAttachmentRepository } from 'test/repositories/in-memory-question-attachment-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachment-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: FetchRecentQuestionsUseCase;

describe('Fetch recent questions', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    );
    sut = new FetchRecentQuestionsUseCase(inMemoryQuestionsRepository);
  });

  it('should be able to fetch recent questions', async () => {
    await inMemoryQuestionsRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 20),
      }),
    );
    await inMemoryQuestionsRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 18),
      }),
    );
    await inMemoryQuestionsRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 23),
      }),
    );

    const result = await sut.execute({
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.questions).toEqual([
      expect.objectContaining({ createdAt: new Date(2022, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 18) }),
    ]);
  });
  it('should be able to fetch paginated recent questions', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionsRepository.create(
        makeQuestion({
          createdAt: new Date(2022, 0, 20),
        }),
      );
    }

    const result = await sut.execute({
      page: 2,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.questions).toHaveLength(2);
  });
});
