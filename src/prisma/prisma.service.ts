import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  onModuleDestroy() {
    return this.$disconnect();
  }
  onModuleInit() {
    return this.$connect();
  }
  constructor() {
    super({ log: ['error', 'warn'] });
  }
}
