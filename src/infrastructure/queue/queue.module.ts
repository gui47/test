import { Module } from '@nestjs/common';

import { OutboxProcessorService } from './outbox-processor.service.js';
import { SqsPublisherService } from './sqs-publisher.service.js';

@Module({
  providers: [
    SqsPublisherService,
    OutboxProcessorService,
  ],
  exports: [
    SqsPublisherService,
  ],
})
export class QueueModule {}
