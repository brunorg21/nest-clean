import { BadRequestException, Controller, Param, Post } from '@nestjs/common';
import { QuestionPresenter } from '../presenters/question-presenter';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';

@Controller('/questions/:slug')
export class GetQuestionBySlugController {
  constructor(private getQuestionBySlug: GetQuestionBySlugUseCase) {}

  @Post()
  async handle(@Param('slug') slug: string) {
    const result = await this.getQuestionBySlug.execute({
      slug,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value);
    }

    const question = result.value.question;

    return { questions: QuestionPresenter.toHTTP(question) };
  }
}
