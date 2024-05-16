import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { AuthenticateStudentUseCase } from './authenticate-student';
import { makeStudent } from 'test/factories/make-student';

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateStudentUseCase;

describe('Authenticate student', () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    fakeEncrypter = new FakeEncrypter();
    inMemoryStudentsRepository = new InMemoryStudentsRepository();

    sut = new AuthenticateStudentUseCase(
      inMemoryStudentsRepository,
      fakeHasher,
      fakeEncrypter,
    );
  });

  it('should be able to authenticate a student', async () => {
    const student = makeStudent({
      email: 'jhondoe@example.com',
      password: await fakeHasher.hash('123456'),
    });

    inMemoryStudentsRepository.items.push(student);

    const result = await sut.execute({
      email: 'jhondoe@example.com',

      password: '123455',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });
});
