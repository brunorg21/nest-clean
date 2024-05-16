import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ValueObject } from '@/core/entities/value-objects';
import { Slug } from './slug';
import { Attachment } from '../attachment';

export interface QuestionDetailsProps {
  questionId: UniqueEntityId;
  authorId: UniqueEntityId;
  author: string;
  title: string;
  slug: Slug;
  content: string;
  attachments: Attachment[];
  bestAnswerId?: UniqueEntityId | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class QuestionDetails extends ValueObject<QuestionDetailsProps> {
  get questionId() {
    return this.props.questionId;
  }
  get bestAnswerId() {
    return this.props.bestAnswerId;
  }

  get content() {
    return this.props.content;
  }

  get title() {
    return this.props.title;
  }

  get slug() {
    return this.props.slug;
  }

  get attachments() {
    return this.props.attachments;
  }

  get authorId() {
    return this.props.authorId;
  }

  get author() {
    return this.props.author;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: QuestionDetailsProps) {
    return new QuestionDetails(props);
  }
}
