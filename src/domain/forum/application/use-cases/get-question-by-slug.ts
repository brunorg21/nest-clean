import { QuestionRepository } from '../repositories/question-repository';

import { Either, right } from '@/core/either';
import { QuestionDetails } from '../../enterprise/entities/value-objects/question-details';

interface GetQuestionBySlugUseCaseRequest {
  slug: string;
}
type GetQuestionBySlugUseCaseResponse = Either<
  null,
  {
    question: QuestionDetails;
  }
>;

export class GetQuestionBySlugUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({
    slug,
  }: GetQuestionBySlugUseCaseRequest): Promise<GetQuestionBySlugUseCaseResponse> {
    const question = await this.questionRepository.findDetailsBySlug(slug);

    if (!question) {
      throw new Error('Question not found.');
    }

    return right({
      question,
    });
  }
}
