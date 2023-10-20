import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      const hash = await bcrypt.hash(user.password, randomInt(6, 18));
      user.password = hash;
      await this.userRepository.save(user);
      this.rabbitMQService.sendMessage('actions', {
        data: {
          type: 'created',
          created_at: new Date(),
          user_id: user.id,
        },
      });
      return {
        message: 'User created successfully',
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(error.driverError.detail);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number): Promise<User | undefined> {
    try {
      return await this.userRepository.findOneBy({ id: id });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id: id });
      let description = 'User updated: ';
      if (updateUserDto.username) {
        description += `username (${user.username}), `;
        user.username = updateUserDto.username;
      }
      if (updateUserDto.email) {
        description += `email (${user.email}), `;
        user.email = updateUserDto.email;
      }
      if (updateUserDto.password) {
        description += `password, `;
        const hash = await bcrypt.hash(user.password, randomInt(6, 18));
        user.password = hash;
      }
      if (updateUserDto.age) {
        description += `age (${user.age}), `;
        user.age = updateUserDto.age;
      }
      if (updateUserDto.gender) {
        description += `gender (${user.gender}), `;
        user.gender = updateUserDto.gender;
      }

      await this.userRepository.save(user);
      this.rabbitMQService.sendMessage('actions', {
        data: {
          type: 'updated',
          created_at: new Date(),
          description: description.slice(0, -2),
          user_id: user.id,
        },
      });

      return {
        message: 'User updated successfully',
        statusCode: 204,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(error.driverError.detail);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async remove(id: number) {
    try {
      await this.userRepository.delete({ id: id });
      return {
        message: 'User deleted successfully',
        statusCode: 204,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
