
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('live')
  checkLive() {
    return {
      status: 'ok',
      message: 'Wagering Processor is running',
    };
  }
}
