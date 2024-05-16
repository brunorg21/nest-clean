import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';

import { Answer } from '../../enterprise/entities/answer';
import { Either, right } from '@/core/either';
import { Injectable } from '@nestjs/common';

interface FetchQuestionAnswersUseCaseRequest {
  page: number;
  questionId: string;
}
type FetchQuestionAnswersUseCaseResponse = Either<
  null,
  {
    answers: Answer[];
  }
>;

@Injectable()
export class FetchQuestionAnswersUseCase {
  constructor(private answerRepository: AnswersRepository) {}

  async execute({
    page,
    questionId,
  }: FetchQuestionAnswersUseCaseRequest): Promise<FetchQuestionAnswersUseCaseResponse> {
    const answers = await this.answerRepository.findManyByQuestionId(
      questionId,
      {
        page,
      },
    );

    return right({
      answers,
    });
  }
}
