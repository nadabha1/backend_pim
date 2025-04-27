import { Test, TestingModule } from '@nestjs/testing';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';


describe('AiController', () => {
  let controller: AIController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [AIService],
    }).compile();

    controller = module.get<AIController>(AIController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
