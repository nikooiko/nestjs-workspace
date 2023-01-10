import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { User } from '@app/todo/prisma-client';

export class UserDataDto implements Partial<User> {
  @ApiProperty()
  @IsUUID()
  id: string;
}
