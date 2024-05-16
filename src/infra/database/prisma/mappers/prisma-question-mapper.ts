import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { Question as PrismaQuestion, Prisma } from '@prisma/client';

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestion): Question {
    return Question.create(
      {
        authorId: new UniqueEntityId(raw.athorId),
        content: raw.content,
        title: raw.title,
        slug: Slug.create(raw.slug),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        bestAnswerId: raw.bestAnswerId
          ? new UniqueEntityId(raw.bestAnswerId)
          : null,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(question: Question): Prisma.QuestionUncheckedCreateInput {
    return {
      id: question.id.toString(),
      athorId: question.authorId.toString(),
      bestAnswerId: question.bestAnswerId?.toString(),
      content: question.content,
      title: question.title,
      slug: question.slug.value,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
