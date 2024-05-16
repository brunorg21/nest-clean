import { PaginationParams } from '@/core/repositories/pagination-params';
import { Question } from '../../enterprise/entities/question';
import { QuestionDetails } from '../../enterprise/entities/value-objects/question-details';

export abstract class QuestionRepository {
  abstract create(question: Question): Promise<void>;
  abstract findBySlug(slug: string): Promise<Question | null>;
  abstract findDetailsBySlug(slug: string): Promise<QuestionDetails | null>;
  abstract delete(question: Question): Promise<void>;
  abstract findById(questionId: string): Promise<Question | null>;
  abstract save(question: Question): Promise<void>;
  abstract findManyRecent(params: PaginationParams): Promise<Question[]>;
}