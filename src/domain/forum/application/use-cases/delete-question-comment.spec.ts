import { beforeEach, describe, expect, it } from 'vitest';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';

import { DeleteQuestionCommentUseCase } from './delete-question-comment';
import { makeQuestionComment } from 'test/factories/make-question-comment';
import { NotAllowedError } from '../../../../core/errors/errors/not-allowed-error';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: DeleteQuestionCommentUseCase;

describe('Delete Question comment', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository,
    );

    sut = new DeleteQuestionCommentUseCase(inMemoryQuestionCommentsRepository);
  });

  it('should be able to delete question comment', async () => {
    const questionComment = makeQuestionComment();

    await inMemoryQuestionCommentsRepository.create(questionComment);

    await sut.execute({
      questionCommentId: questionComment.id.toString(),
      authorId: questionComment.authorId.toString(),
    });

    expect(inMemoryQuestionCommentsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete another user question comment', async () => {
    const questionComment = makeQuestionComment({
      authorId: new UniqueEntityId('author-1'),
    });

    await inMemoryQuestionCommentsRepository.create(questionComment);

    const result = await sut.execute({
      questionCommentId: questionComment.id.toString(),
      authorId: 'author-2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
