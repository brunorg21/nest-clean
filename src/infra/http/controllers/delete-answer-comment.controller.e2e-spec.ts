import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import request from 'supertest';
import { AnswerFactory } from 'test/factories/make-answer';
import { AnswerCommentFactory } from 'test/factories/make-answer-comment';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('delete answer comment (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let answerCommentFactory: AnswerCommentFactory;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        AnswerCommentFactory,
        AnswerFactory,
        QuestionFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    prisma = moduleRef.get(PrismaService);
    answerFactory = moduleRef.get(AnswerFactory);
    answerCommentFactory = moduleRef.get(AnswerCommentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    await app.init();
  });

  test('[DELETE] /answers/comments/:id', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    });

    const answerComment = await answerCommentFactory.makePrismaAnswerComment({
      answerId: answer.id,
      authorId: user.id,
    });

    const answerCommentId = answerComment.id.toString();

    const response = await request(app.getHttpServer())
      .delete(`/answers/comments/${answerCommentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(204);

    const commentsOnDatabase = await prisma.comment.findUnique({
      where: {
        id: answerCommentId,
      },
    });

    expect(commentsOnDatabase).toBeNull();
  });
});
