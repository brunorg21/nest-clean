import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common';

import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { TokenSchema } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation';
import { z } from 'zod';
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>;

@Controller('/questions/:id')
export class EditQuestionController {
  constructor(private editQuestion: EditQuestionUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(editQuestionBodySchema))
    body: EditQuestionBodySchema,
    @CurrentUser() user: TokenSchema,
    @Param('id') questionId: string,
  ) {
    const { content, title } = body;

    const result = await this.editQuestion.execute({
      authorId: user.sub,
      content,
      title,
      attachmentsIds: [],
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }
  }
}
