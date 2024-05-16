import { beforeEach, describe, expect, it } from 'vitest';

import { ReadNotificationUseCase } from './read-notification';

import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notification-repository';
import { makeNotification } from 'test/factories/make-notification';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

let inMemoryNotificationRepository: InMemoryNotificationRepository;

let sut: ReadNotificationUseCase;

describe('Read Notification', () => {
  beforeEach(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository();
    sut = new ReadNotificationUseCase(inMemoryNotificationRepository);
  });

  it('should be able to read a notification', async () => {
    const notification = makeNotification();

    await inMemoryNotificationRepository.create(notification);

    const result = await sut.execute({
      recipientId: notification.recipientId.toString(),
      notificationId: notification.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotificationRepository.items[0].readAt).toEqual(
      expect.any(Date),
    );
  });

  it('should not be able to read a notification from another user', async () => {
    const notification = makeNotification({
      recipientId: new UniqueEntityId('1'),
    });

    await inMemoryNotificationRepository.create(notification);
    const result = await sut.execute({
      notificationId: notification.id.toString(),
      recipientId: '4',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
