import { Test, TestingModule } from '@nestjs/testing';
import { FreeTimeController } from './free-times.controller';
import { FreeTimeService } from './free-times.service';

describe('FreeTimeController', () => {
  let controller: FreeTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreeTimeController],
      providers: [FreeTimeService],
    }).compile();

    controller = module.get<FreeTimeController>(FreeTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
