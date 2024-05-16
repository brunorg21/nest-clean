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
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer';

const editAnswerBodySchema = z.object({
  content: z.string(),
});

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>;

@Controller('/answers/:id')
export class EditAnswerController {
  constructor(private editAnswer: EditAnswerUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(new ZodValidationPipe(editAnswerBodySchema))
    body: EditAnswerBodySchema,
    @CurrentUser() user: TokenSchema,
    @Param('id') answerId: string,
  ) {
    const { content } = body;

    const result = await this.editAnswer.execute({
      authorId: user.sub,
      content,
      attachmentsIds: [],
      answerId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }
  }
}
