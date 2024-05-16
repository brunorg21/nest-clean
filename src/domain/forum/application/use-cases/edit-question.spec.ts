import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';

import { makeQuestion } from 'test/factories/make-question';
import { EditQuestionUseCase } from './edit-question';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { NotAllowedError } from '../../../../core/errors/errors/not-allowed-error';
import { InMemoryQuestionAttachmentRepository } from 'test/repositories/in-memory-question-attachment-repository';
import { makeQuestionAttachment } from 'test/factories/make-question-attachment';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachment-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentRepository: InMemoryQuestionAttachmentRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: EditQuestionUseCase;

describe('Edit Question ', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryQuestionAttachmentRepository =
      new InMemoryQuestionAttachmentRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    );

    sut = new EditQuestionUseCase(
      inMemoryQuestionsRepository,
      inMemoryQuestionAttachmentRepository,
    );
  });

  it('should be able to edit a question', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-1'),
    );

    await inMemoryQuestionsRepository.create(newQuestion);

    inMemoryQuestionAttachmentRepository.items.push(
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId('1'),
      }),
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId('2'),
      }),
    );

    await sut.execute({
      authorId: 'author-1',
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
      questionId: newQuestion.id.toValue(),
      attachmentsIds: ['1', '3'],
    });

    expect(inMemoryQuestionsRepository.items[0]).toMatchObject({
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
    });
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toHaveLength(2);
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityId('3') }),
    ]);
  });
  it('should not be able to edit a question from another user', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-1'),
    );

    inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      authorId: 'author-2',
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
      questionId: newQuestion.id.toValue(),
      attachmentsIds: [],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
