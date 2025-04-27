import { Test, TestingModule } from '@nestjs/testing';
import { AnalyseIaController } from './analyse-ia.controller';
import { AnalyseIaService } from './analyse-ia.service';

describe('AnalyseIaController', () => {
  let controller: AnalyseIaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyseIaController],
      providers: [AnalyseIaService],
    }).compile();

    controller = module.get<AnalyseIaController>(AnalyseIaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
