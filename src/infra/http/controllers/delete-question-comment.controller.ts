import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common';

import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { TokenSchema } from '@/infra/auth/jwt.strategy';

import { DeleteQuestionCommentUseCase } from '@/domain/forum/application/use-cases/delete-question-comment';

@Controller('/questions/comments/:id')
export class DeleteQuestionCommentController {
  constructor(private deleteQuestionComment: DeleteQuestionCommentUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUser()
    user: TokenSchema,
    @Param('id') questionCommentId: string,
  ) {
    const result = await this.deleteQuestionComment.execute({
      authorId: user.sub,
      questionCommentId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }
  }
}
