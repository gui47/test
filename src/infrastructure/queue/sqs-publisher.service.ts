
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class SqsPublisherService {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.queueUrl = this.configService.getOrThrow<string>('SQS_QUEUE_URL');

    this.client = new SQSClient({
      region: this.configService.get<string>('AWS_REGION') ?? 'us-east-1',
      endpoint: this.configService.get<string>('SQS_ENDPOINT') ?? 'http://localhost:4566',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? 'test',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? 'test',
      },
    });
  }

  async publish(event: {
    id: string;
    eventType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify({
          eventId: event.id,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          payload: event.payload,
        }),
      }),
    );
  }
}
