import { Either, left, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error';
import { Attachment } from '../../enterprise/entities/attachment';
import { AttachmentsRepository } from '../repositories/attachments-repository';
import { Uploader } from '../storage/uploader';

interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string;
  fileType: string;
  body: Buffer;
}
type UploadAndCreateAttachmentUseCaseResponse = Either<
  InvalidAttachmentTypeError,
  {
    attachment: Attachment;
  }
>;

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private attachmentRepository: AttachmentsRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentUseCaseRequest): Promise<UploadAndCreateAttachmentUseCaseResponse> {
    if (
      /^image\/(jpeg|png)$|^application\/pdf$|^image\/(jpeg|jpg)$/.test(
        fileType,
      )
    ) {
      return left(new InvalidAttachmentTypeError(fileType));
    }

    const { url } = await this.uploader.upload({
      body,
      fileName,
      fileType,
    });

    const attachment = Attachment.create({
      link: url,
      title: fileName,
    });

    await this.attachmentRepository.create(attachment);
    return right({
      attachment,
    });
  }
}
