import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';

import { Slug } from '../../enterprise/entities/value-objects/slug';

import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionAttachmentRepository } from 'test/repositories/in-memory-question-attachment-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachment-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';
import { makeStudent } from 'test/factories/make-student';

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: GetQuestionBySlugUseCase;

describe('Get Question by Slug', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    );
    sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository);
  });

  it('should be able to get a question by slug', async () => {
    const student = makeStudent({
      name: 'Jhon doe',
    });

    inMemoryStudentsRepository.items.push(student);

    const newQuestion = makeQuestion({
      authorId: student.id,
      slug: Slug.create('example-question'),
    });

    await inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      slug: 'example-question',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryQuestionsRepository.items[0]).toEqual(
      result.value?.question,
    );
  });
});
