// src/analyse/analyse.controller.ts
import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { AnalyseIaService } from './analyse-ia.service';

@Controller('analyse')
export class AnalyseIaController {
  constructor(private readonly analyseService: AnalyseIaService) {}

  @Post('log')
  async log(@Body() body: { userId: string; type: string; value: string }) {
    await this.analyseService.logActivity(body.userId, body.type, body.value);
    return { success: true };
  }

  @Get('run/:userId')
  async runAnalysis(@Param('userId') userId: string) {
    const prefs = await this.analyseService.analyseUser(userId);
    return { success: true, preferences: prefs };
  }
}
