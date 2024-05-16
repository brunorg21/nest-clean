import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation';

import { z } from 'zod';
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student';
import { WrongCredentialsError } from '@/domain/forum/application/use-cases/errors/wrong-credentials-error';
import { Public } from '@/infra/auth/public';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller('/sessions')
export class AuthenticateController {
  constructor(private authenticateStudent: AuthenticateStudentUseCase) {}

  @Post()
  @Public()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body;

    const result = await this.authenticateStudent.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof WrongCredentialsError) {
        throw new UnauthorizedException(error.message);
      }

      throw new BadRequestException(error);
    }

    const { accessToken } = result.value;

    return {
      accessToken,
    };
  }
}
