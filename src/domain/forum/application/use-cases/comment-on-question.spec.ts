import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { CommentOnQuestionUseCase } from './comment-on-question';
import { InMemoryQuestionAttachmentRepository } from 'test/repositories/in-memory-question-attachment-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachment-repository';

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: CommentOnQuestionUseCase;

describe('Comment on Question', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentRepository();
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository,
    );
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    );
    sut = new CommentOnQuestionUseCase(
      inMemoryQuestionsRepository,
      inMemoryQuestionCommentsRepository,
    );
  });

  it('should be able to comment on question', async () => {
    const newQuestion = makeQuestion();

    await inMemoryQuestionsRepository.create(newQuestion);

    await sut.execute({
      questionId: newQuestion.id.toString(),
      authorId: newQuestion.authorId.toString(),
      content: 'Novo comentário',
    });

    expect(inMemoryQuestionCommentsRepository.items[0].content).toEqual(
      'Novo comentário',
    );
  });
});
