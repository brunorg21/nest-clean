import { BadRequestException, Controller, Post, Query } from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation';
import { z } from 'zod';
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions';
import { QuestionPresenter } from '../presenters/question-presenter';

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/questions')
export class FetchRecentQuestions {
  constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

  @Post()
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchRecentQuestions.execute({
      page,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }

    const questions = result.value.questions;

    return { questions: questions.map(QuestionPresenter.toHTTP) };
  }
}
