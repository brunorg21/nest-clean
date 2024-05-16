import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AnswerFactory } from 'test/factories/make-answer';
import { AnswerCommentFactory } from 'test/factories/make-answer-comment';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('fetch answer comments (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let answerCommentFactory: AnswerCommentFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerCommentFactory,
        AnswerFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    answerCommentFactory = moduleRef.get(AnswerCommentFactory);
    await app.init();
  });

  test('[GET] /answers/:answerId/comments', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'Jhon doe',
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });
    const question = await questionFactory.makePrismaQuestion({
      title: 'Question 01',
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    });

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        answerId: answer.id,
        authorId: user.id,
        content: 'comment-01',
      }),
      answerCommentFactory.makePrismaAnswerComment({
        answerId: answer.id,
        authorId: user.id,
        content: 'comment-02',
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id.toString()}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      questions: expect.arrayContaining([
        expect.objectContaining({ content: 'comment-01' }),
        expect.objectContaining({ content: 'comment-02' }),
      ]),
    });
  });
});
