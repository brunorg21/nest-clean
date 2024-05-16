import {
  BadRequestException,
  Controller,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation';
import { z } from 'zod';
import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments';
import { CommentWithAuthorPresenter } from '../presenters/comment-with-author-presenter';

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/questions/:questionId/comments')
export class FetchQuestionCommentsController {
  constructor(private fetchQuestionComments: FetchQuestionCommentsUseCase) {}

  @Post()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @Param('questionId') questionId: string,
  ) {
    const result = await this.fetchQuestionComments.execute({
      page,
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }

    const comments = result.value.comments;

    return { comments: comments.map(CommentWithAuthorPresenter.toHTTP) };
  }
}
