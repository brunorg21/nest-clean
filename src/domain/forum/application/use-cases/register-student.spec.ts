import { beforeEach, describe, expect, it } from 'vitest';
import { RegisterStudentUseCase } from './register-student';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let sut: RegisterStudentUseCase;

describe('Register student', () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    inMemoryStudentsRepository = new InMemoryStudentsRepository();

    sut = new RegisterStudentUseCase(inMemoryStudentsRepository, fakeHasher);
  });

  it('should be able to register a new student', async () => {
    const result = await sut.execute({
      email: 'jhondoe@example.com',
      name: 'jhon doe',
      password: '123455',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      student: inMemoryStudentsRepository.items[0],
    });
  });

  it('should hash student password upon registration', async () => {
    const result = await sut.execute({
      email: 'jhondoe@example.com',
      name: 'jhon doe',
      password: '123455',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryStudentsRepository.items[0].password).toEqual(
      '123456-hashed',
    );
  });
});
