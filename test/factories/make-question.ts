import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import {
  Question,
  QuestionProps,
} from '@/domain/forum/enterprise/entities/question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { PrismaQuestionMapper } from '@/infra/database/prisma/mappers/prisma-question-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

export function makeQuestion(
  override: Partial<QuestionProps> = {},
  id?: UniqueEntityId,
) {
  const newQuestion = Question.create(
    {
      authorId: new UniqueEntityId('1'),
      content: faker.lorem.text(),
      title: faker.word.sample(),
      bestAnswerId: new UniqueEntityId('1'),
      slug: Slug.create('example-question'),
      ...override,
    },
    id,
  );

  return newQuestion;
}

@Injectable()
export class QuestionFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaQuestion(
    data: Partial<QuestionProps> = {},
  ): Promise<Question> {
    const question = makeQuestion(data);

    await this.prisma.question.create({
      data: PrismaQuestionMapper.toPrisma(question),
    });

    return question;
  }
}
