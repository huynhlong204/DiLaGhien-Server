// src/interactions/interactions.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { LogInteractionDto } from './dto/log-interaction.dto';
import { Request } from 'express';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  async logInteraction(@Body() dto: LogInteractionDto) {
    return this.interactionsService.logInteraction(dto);
  }
}
