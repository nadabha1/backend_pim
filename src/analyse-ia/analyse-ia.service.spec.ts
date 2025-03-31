import { Test, TestingModule } from '@nestjs/testing';
import { AnalyseIaService } from './analyse-ia.service';

describe('AnalyseIaService', () => {
  let service: AnalyseIaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyseIaService],
    }).compile();

    service = module.get<AnalyseIaService>(AnalyseIaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
