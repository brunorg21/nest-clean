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
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question';

const answerQuestionBodySchema = z.object({
  content: z.string(),
});

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>;

@Controller('/questions/:questionId/answers')
export class AnswerQuestionController {
  constructor(private answerQuestion: AnswerQuestionUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(answerQuestionBodySchema))
    body: AnswerQuestionBodySchema,
    @CurrentUser() user: TokenSchema,
    @Param('questionId') questionId: string,
  ) {
    const { content } = body;

    const result = await this.answerQuestion.execute({
      content,
      attachmentsIds: [],
      instructorId: user.sub,
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }
  }
}
