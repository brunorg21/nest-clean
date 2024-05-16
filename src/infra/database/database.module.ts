import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaAnswerAttachmentsRepository } from './prisma/repositories/prisma-answer-attachment-repository';
import { PrismaAnswersRepository } from './prisma/repositories/prisma-answers-repository';
import { PrismaQuestionAttachmentsRepository } from './prisma/repositories/prisma-question-attachments-repository';
import { PrismaQuestionCommentsRepository } from './prisma/repositories/prisma-question-comments-repository';
import { PrismaQuestionRepository } from './prisma/repositories/prisma-questions-repository';
import { PrismaAnswerCommentsRepository } from './prisma/repositories/prisma-answer-comments-repository';
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository';
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository';
import { PrismaStudentRepository } from './prisma/repositories/prisma-students-repository';
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository';
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository';
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: AnswerAttachmentsRepository,
      useClass: PrismaAnswerAttachmentsRepository,
    },
    {
      provide: AnswersRepository,
      useClass: PrismaAnswersRepository,
    },
    {
      provide: QuestionAttachmentsRepository,
      useClass: PrismaQuestionAttachmentsRepository,
    },
    {
      provide: QuestionCommentsRepository,
      useClass: PrismaQuestionCommentsRepository,
    },
    {
      provide: QuestionRepository,
      useClass: PrismaQuestionRepository,
    },
    {
      provide: StudentsRepository,
      useClass: PrismaStudentRepository,
    },
    {
      provide: AnswersRepository,
      useClass: PrismaAnswersRepository,
    },
    {
      provide: AnswerCommentsRepository,
      useClass: PrismaAnswerCommentsRepository,
    },
  ],
  exports: [
    PrismaService,
    AnswerAttachmentsRepository,
    AnswersRepository,
    QuestionAttachmentsRepository,
    QuestionCommentsRepository,
    PrismaQuestionCommentsRepository,
    QuestionRepository,
    StudentsRepository,
    AnswerCommentsRepository,
  ],
})
export class DatabaseModule {}
