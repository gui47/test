import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { SqsPublisherService } from './sqs-publisher.service.js';

interface OutboxEventRow {
  id: string;
  event_type: string;
  aggregate_id: string;
  payload: Record<string, unknown>;
  attempts: number;
}

@Injectable()
export class OutboxProcessorService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(OutboxProcessorService.name);

  private timer: ReturnType<typeof setInterval> | undefined;

  private processing = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly publisher: SqsPublisherService,
  ) {}

  onModuleInit(): void {
    this.logger.log('Outbox processor iniciado.');

    this.timer = setInterval(() => {
      void this.processPendingEvents();
    }, 5000);

    void this.processPendingEvents();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async processPendingEvents(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      while (true) {
        const event = await this.claimNextEvent();

        if (!event) {
          break;
        }

        try {
          await this.publisher.publish({
            id: event.id,
            eventType: event.event_type,
            aggregateId: event.aggregate_id,
            payload: event.payload,
          });

          await this.dataSource.query(
            `
              UPDATE outbox_events
              SET status = 'PROCESSED',
                  processed_at = NOW(),
                  last_error = NULL
              WHERE id = $1
            `,
            [event.id],
          );

          this.logger.log(`Evento ${event.id} enviado ao SQS.`);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Unknown SQS error';

          const attempts = event.attempts + 1;
          const status = attempts >= 5 ? 'FAILED' : 'PENDING';

          await this.dataSource.query(
            `
              UPDATE outbox_events
              SET status = $2,
                  attempts = $3,
                  last_error = $4
              WHERE id = $1
            `,
            [event.id, status, attempts, message],
          );

          this.logger.error(
            `Falha ao publicar evento ${event.id}: ${message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Erro ao processar Outbox.',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.processing = false;
    }
  }

  private async claimNextEvent(): Promise<OutboxEventRow | null> {
    return this.dataSource.transaction(async (manager) => {
      const events = (await manager.query(`
        SELECT
          id,
          event_type,
          aggregate_id,
          payload,
          attempts
        FROM outbox_events
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `)) as OutboxEventRow[];

      const event = events[0];

      if (!event) {
        return null;
      }

      await manager.query(
        `
          UPDATE outbox_events
          SET status = 'PROCESSING'
          WHERE id = $1
        `,
        [event.id],
      );

      return event;
    });
  }
}