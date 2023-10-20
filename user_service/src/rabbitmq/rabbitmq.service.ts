import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: amqp.Connection;

  constructor() {
    this.connectToRabbitMQ();
  }

  async connectToRabbitMQ() {
    this.connection = await amqp.connect(process.env.AMQP_URL);
  }

  async sendMessage(queueName: string, message: any) {
    const channel = await this.connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  }
}
