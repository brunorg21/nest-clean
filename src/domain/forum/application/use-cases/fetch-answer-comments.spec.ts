import { beforeEach, describe, expect, it } from 'vitest';

import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository';
import { makeAnswerComment } from 'test/factories/make-answer-comment';
import { FetchAnswerCommentsUseCase } from './fetch-answer-comment';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';
import { makeStudent } from 'test/factories/make-student';

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: FetchAnswerCommentsUseCase;

describe('Fetch answers comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentsRepository,
    );
    sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository);
  });

  it('should be able to fetch answer comments', async () => {
    const student = makeStudent({
      name: 'Jhon Doe',
    });

    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId('answer-1'),
        authorId: student.id,
      }),
    );
    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId('answer-1'),
        authorId: student.id,
      }),
    );
    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId('answer-1'),
        authorId: student.id,
      }),
    );

    const result = await sut.execute({
      page: 1,
      answerId: 'answer-1',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.comments).toHaveLength(3);
  });
  it('should be able to fetch paginated answer comments', async () => {
    const student = makeStudent({
      name: 'Jhon Doe',
    });

    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityId('answer-1'),
          authorId: student.id,
        }),
      );
    }

    const result = await sut.execute({
      page: 2,
      answerId: 'answer-1',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.comments).toHaveLength(2);
  });
});
