import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { TokenSchema } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation';
import { z } from 'zod';
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question';

const commentOnQuestionBodySchema = z.object({
  content: z.string(),
});

type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>;

@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private commentOnQuestion: CommentOnQuestionUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(commentOnQuestionBodySchema))
    body: CommentOnQuestionBodySchema,
    @CurrentUser() user: TokenSchema,
    @Param('questionId') questionId: string,
  ) {
    const { content } = body;

    const result = await this.commentOnQuestion.execute({
      questionId,
      authorId: user.sub,
      content,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }
  }
}
