import { AggregateRoot } from '@/core/entities/aggretate-root';
import { Slug } from './value-objects/slug';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import dayjs from 'dayjs';
import { QuestionAttachmentList } from './question-attachment-list';
import { QuestionBestAnswerChosenEvent } from '../events/question-best-answer-chosen-event';

export interface QuestionProps {
  authorId: UniqueEntityId;
  bestAnswerId?: UniqueEntityId | null;
  title: string;
  content: string;
  slug: Slug;
  createdAt: Date;
  updatedAt?: Date | null;
  attachments: QuestionAttachmentList;
}

export class Question extends AggregateRoot<QuestionProps> {
  get authorId() {
    return this.props.authorId;
  }
  get bestAnswerId() {
    return this.props.bestAnswerId;
  }
  get title() {
    return this.props.title;
  }
  get content() {
    return this.props.content;
  }
  get slug() {
    return this.props.slug;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  get attachments() {
    return this.props.attachments;
  }

  get isNew(): boolean {
    return dayjs().diff(this.createdAt, 'days') <= 3;
  }

  get excerpt() {
    return this.content.substring(0, 120).trimEnd().concat('...');
  }

  set content(content: string) {
    this.props.content = content;
    this.touch();
  }

  set attachments(attachments: QuestionAttachmentList) {
    this.props.attachments = attachments;
  }

  set bestAnswerId(bestAnswerId: UniqueEntityId | undefined | null) {
    if (bestAnswerId === undefined || null) {
      return;
    }

    if (
      this.props.bestAnswerId === undefined ||
      !this.props.bestAnswerId!.equals(bestAnswerId!)
    ) {
      this.addDomainEvent(
        new QuestionBestAnswerChosenEvent(this, bestAnswerId!),
      );
    }

    this.props.bestAnswerId = bestAnswerId;
    this.touch();
  }

  set title(title: string) {
    this.props.title = title;
    this.props.slug = Slug.createFromText(title);
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<QuestionProps, 'createdAt' | 'slug' | 'attachments'>,
    id?: UniqueEntityId,
  ) {
    const question = new Question(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        slug: props.slug ?? Slug.createFromText(props.title),
        attachments: props.attachments ?? new QuestionAttachmentList(),
      },
      id,
    );

    return question;
  }
}
