import { Either, right } from '@/core/either';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Notification } from '../../enterprise/entities/notification';
import { NotificationRepository } from '../repositories/notification-repository';

export interface SendNotificationUseCaseRequest {
  recipientId: string;
  title: string;
  content: string;
}
export type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification;
  }
>;

export class SendNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute({
    recipientId,
    content,
    title,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
      recipientId: new UniqueEntityId(recipientId),
      content,
      title,
    });

    await this.notificationRepository.create(notification);

    return right({
      notification,
    });
  }
}
