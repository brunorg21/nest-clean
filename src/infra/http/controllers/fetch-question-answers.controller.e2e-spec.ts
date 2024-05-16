import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AnswerFactory } from 'test/factories/make-answer';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('fetch question answers (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    await app.init();
  });

  test('[GET] /questions/:questionId/answers', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });
    const question = await questionFactory.makePrismaQuestion({
      title: 'Question 01',
      authorId: user.id,
    });
    await Promise.all([
      answerFactory.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: 'answer-01',
      }),
      answerFactory.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: 'answer-02',
      }),
      answerFactory.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: 'answer-03',
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id.toString()}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      questions: expect.arrayContaining([
        expect.objectContaining({ content: 'answer-01' }),
        expect.objectContaining({ content: 'answer-02' }),
        expect.objectContaining({ content: 'answer-03' }),
      ]),
    });
  });
});
