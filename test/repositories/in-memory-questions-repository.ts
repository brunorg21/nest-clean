import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { InMemoryAttachmentsRepository } from './in-memory-attachment-repository';
import { InMemoryQuestionAttachmentRepository } from './in-memory-question-attachment-repository';
import { InMemoryStudentsRepository } from './in-memory-student-repository';

export class InMemoryQuestionsRepository implements QuestionRepository {
  public items: Question[] = [];

  constructor(
    private questionAttachmentsRepository: InMemoryQuestionAttachmentRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
    private studentsRepository: InMemoryStudentsRepository,
  ) {}

  async create(question: Question): Promise<void> {
    this.items.push(question);

    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = this.items.find(
      (question) => question.slug.value === slug,
    );

    if (!question) {
      return null;
    }

    return question;
  }

  async findDetailsBySlug(slug: string): Promise<QuestionDetails | null> {
    const question = this.items.find(
      (question) => question.slug.value === slug,
    );

    if (!question) {
      return null;
    }

    const author = this.studentsRepository.items.find((student) => {
      return student.id.equals(question.authorId);
    });

    if (!author) {
      throw new Error(
        `Author with ID ${question.authorId.toString()} does not exist.`,
      );
    }

    const questionAttachments = this.questionAttachmentsRepository.items.filter(
      (questionAttachment) => {
        return questionAttachment.questionId.equals(question.id);
      },
    );

    const attachments = questionAttachments.map((questionAttachment) => {
      const attachment = this.attachmentsRepository.items.find((attachment) => {
        return attachment.id.equals(questionAttachment.attachmentId);
      });

      if (!attachment) {
        throw new Error(
          `Attachment with ID ${questionAttachment.attachmentId.toString()} does not exist.`,
        );
      }

      return attachment;
    });

    return QuestionDetails.create({
      attachments,
      questionId: question.id,
      authorId: question.authorId,
      author: author.name,
      content: question.content,
      createdAt: question.createdAt,
      slug: question.slug,
      title: question.title,
      bestAnswerId: question.bestAnswerId,
      updatedAt: question.updatedAt,
    });
  }

  async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
    const questions = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return questions;
  }

  async findById(questionId: string): Promise<Question | null> {
    const question = this.items.find(
      (question) => question.id.toString() === questionId,
    );

    if (!question) {
      return null;
    }

    return question;
  }

  async delete(question: Question): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === question.id);

    this.items.splice(itemIndex, 1);

    this.questionAttachmentsRepository.deleteManyByQuestionId(
      question.id.toString(),
    );
  }

  async save(question: Question): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === question.id);

    this.items[itemIndex] = question;
    DomainEvents.dispatchEventsForAggregate(question.id);
  }
}
