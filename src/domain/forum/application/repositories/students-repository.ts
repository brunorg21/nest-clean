import { Student } from '../../enterprise/entities/student';

export abstract class StudentsRepository {
  abstract create(question: Student): Promise<void>;
  abstract findByEmail(questionId: string): Promise<Student | null>;
}
