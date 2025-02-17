import { Test, TestingModule } from '@nestjs/testing';
import { CarnetController } from './carnet.controller';
import { CarnetService } from './carnet.service';

describe('CarnetController', () => {
  let controller: CarnetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarnetController],
      providers: [CarnetService],
    }).compile();

    controller = module.get<CarnetController>(CarnetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
