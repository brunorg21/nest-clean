import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { QuestionFactory } from 'test/factories/make-question';
import { QuestionCommentFactory } from 'test/factories/make-question-comment';
import { StudentFactory } from 'test/factories/make-student';

describe('fetch question comments (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let questionCommentFactory: QuestionCommentFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = moduleRef.get(JwtService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    questionCommentFactory = moduleRef.get(QuestionCommentFactory);
    await app.init();
  });

  test('[GET] /questions/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'Jhon Doe',
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });
    const question = await questionFactory.makePrismaQuestion({
      title: 'Question 01',
      authorId: user.id,
    });
    await Promise.all([
      questionCommentFactory.makePrismaQuestionComment({
        questionId: question.id,
        authorId: user.id,
        content: 'comment-01',
      }),
      questionCommentFactory.makePrismaQuestionComment({
        questionId: question.id,
        authorId: user.id,
        content: 'comment-02',
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id.toString()}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({ content: 'comment-01', name: 'Jhon Doe' }),
        expect.objectContaining({ content: 'comment-02', name: 'Jhon Doe' }),
      ]),
    });
  });
});
