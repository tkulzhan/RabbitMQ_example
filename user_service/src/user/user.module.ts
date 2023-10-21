import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { History } from './entities/history.entity';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, History])],
  controllers: [UserController],
  providers: [UserService, RabbitMQService],
})
export class UserModule {}
