import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '@/domain/forum/enterprise/entities/answer';

export class InMemoryAnswersRepository implements AnswersRepository {
  public items: Answer[] = [];

  constructor(
    private answerAttachmentRepository: AnswerAttachmentsRepository,
  ) {}

  async create(answer: Answer): Promise<void> {
    this.items.push(answer);

    DomainEvents.dispatchEventsForAggregate(answer.id);
  }

  async findById(questionId: string): Promise<Answer | null> {
    const answer = this.items.find(
      (answer) => answer.id.toString() === questionId,
    );

    if (!answer) {
      return null;
    }

    return answer;
  }

  async delete(answer: Answer): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === answer.id);

    this.items.splice(itemIndex, 1);

    this.answerAttachmentRepository.deleteManyByAnswerId(answer.id.toString());
  }

  async save(answer: Answer): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === answer.id);

    this.items[itemIndex] = answer;
    DomainEvents.dispatchEventsForAggregate(answer.id);
  }

  async findManyByQuestionId(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<Answer[]> {
    const answers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice((page - 1) * 20, page * 20);

    return answers;
  }
}
