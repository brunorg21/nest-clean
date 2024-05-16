import {
  BadRequestException,
  Controller,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation';
import { z } from 'zod';
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comment';

import { CommentWithAuthorPresenter } from '../presenters/comment-with-author-presenter';

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/answers/:answerId/comments')
export class FetchAnswerCommentsController {
  constructor(private fetchAnswerComments: FetchAnswerCommentsUseCase) {}

  @Post()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @Param('answerId') answerId: string,
  ) {
    const result = await this.fetchAnswerComments.execute({
      page,
      answerId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }

    const answerComments = result.value.comments;

    return {
      answerComments: answerComments.map(CommentWithAuthorPresenter.toHTTP),
    };
  }
}
