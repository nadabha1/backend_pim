import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CarnetService } from './carnet.service';

@Controller('carnets')
export class CarnetController {
  constructor(private readonly carnetService: CarnetService) {}

  @Post()
  createCarnet(@Body() data: any) {
    return this.carnetService.createCarnet(data);
  }
  @Get('user/:userId')
  async getUserCarnet(@Param('userId') userId: string) {
    const carnet = await this.carnetService.getCarnetByUserId(userId);
    if (!carnet) return {};  // ✅ Return empty object if no carnet found
    return carnet;
  }
  
@Post('user/:userId')
async createCarnetForUser(@Param('userId') userId: string, @Body('title') title: string) {
  console.log(`User ${userId} is trying to create a carnet with title: ${title}`);
  return this.carnetService.createCarnetForUser(userId, title);
}

@Post('user/:userId/place')
async addPlaceToUserCarnet(@Param('userId') userId: string, @Body() placeData: any) {
  return this.carnetService.addPlaceToUserCarnet(userId, placeData);
}



@Post(':carnetId/places')
async addPlace(
  @Param('carnetId') carnetId: string, 
  @Body() placeData: any
) {
  console.log(`Adding place to carnet ${carnetId}`, placeData);
  return this.carnetService.addPlace(carnetId, placeData);
}

  @Get()
  getAllCarnets() {
    return this.carnetService.getAllCarnets();
  }

  @Get(':id')
  getCarnetById(@Param('id') id: string) {
    return this.carnetService.getCarnetById(id);
  }

  @Put(':id')
  updateCarnet(@Param('id') id: string, @Body() data: any) {
    return this.carnetService.updateCarnet(id, data);
  }

  @Delete(':id')
  deleteCarnet(@Param('id') id: string) {
    return this.carnetService.deleteCarnet(id);
  }
}
