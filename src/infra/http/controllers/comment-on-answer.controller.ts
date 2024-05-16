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
import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer';

const commentOnAnswerBodySchema = z.object({
  content: z.string(),
});

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>;

@Controller('/answers/:answerId/comments')
export class CommentOnAnswerController {
  constructor(private commentOnAnswer: CommentOnAnswerUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(commentOnAnswerBodySchema))
    body: CommentOnAnswerBodySchema,
    @CurrentUser() user: TokenSchema,
    @Param('answerId') answerId: string,
  ) {
    const { content } = body;

    const result = await this.commentOnAnswer.execute({
      answerId,
      authorId: user.sub,
      content,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }
  }
}
