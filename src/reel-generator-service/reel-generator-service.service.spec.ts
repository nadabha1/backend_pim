import { Test, TestingModule } from '@nestjs/testing';
import { ReelGeneratorServiceService } from './reel-generator-service.service';

describe('ReelGeneratorServiceService', () => {
  let service: ReelGeneratorServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReelGeneratorServiceService],
    }).compile();

    service = module.get<ReelGeneratorServiceService>(ReelGeneratorServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
