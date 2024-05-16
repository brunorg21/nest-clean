import { beforeEach, describe, expect, it } from 'vitest';
import { FetchQuestionCommentsUseCase } from './fetch-question-comments';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { makeQuestionComment } from 'test/factories/make-question-comment';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';
import { makeStudent } from 'test/factories/make-student';

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe('Fetch questions comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository,
    );
    sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository);
  });

  it('should be able to fetch question comments', async () => {
    const student = makeStudent({ name: 'Jhon Doe' });

    inMemoryStudentsRepository.items.push(student);

    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId('question-1'),
        authorId: student.id,
      }),
    );
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId('question-1'),
        authorId: student.id,
      }),
    );
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId('question-1'),
        authorId: student.id,
      }),
    );

    const result = await sut.execute({
      page: 1,
      questionId: 'question-1',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.comments).toHaveLength(3);
  });
  it('should be able to fetch paginated question comments', async () => {
    const student = makeStudent({ name: 'Jhon Doe' });
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionCommentsRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityId('question-1'),
          authorId: student.id,
        }),
      );
    }

    const result = await sut.execute({
      page: 2,
      questionId: 'question-1',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.comments).toHaveLength(2);
  });
});
