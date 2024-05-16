import { beforeEach, describe, expect, it } from 'vitest';

import { SendNotificationUseCase } from './send-notification';

import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notification-repository';

let inMemoryNotificationRepository: InMemoryNotificationRepository;

let sut: SendNotificationUseCase;

describe('Send Notification', () => {
  beforeEach(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository();
    sut = new SendNotificationUseCase(inMemoryNotificationRepository);
  });

  it('should be able to send notification', async () => {
    const result = await sut.execute({
      content: 'Conteúdo da pergunta',
      recipientId: '1',
      title: 'Nova notificação',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotificationRepository.items[0]).toEqual(
      result.value?.notification,
    );
  });
});
