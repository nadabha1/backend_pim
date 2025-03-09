import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
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
  async updateCarnet(
    @Param('id') carnetId: string,
    @Body() updateData: any
  ) {
    return this.carnetService.updateCarnet(carnetId, updateData);
  }
  

  @Delete(':id')
  async deleteCarnet(
    @Param('id') carnetId: string,
    @Body('userId') userId: string,
  ) {
    if (!userId) {
      throw new NotFoundException('User ID is required');
    }
    await this.carnetService.deleteCarnet(carnetId, userId);
    return { message: 'Carnet supprimé avec succès' };
  }
//tessssst
  @Put('user/:userId/unlock/:carnetId')
unlockCarnet(@Param('userId') userId: string, @Param('carnetId') carnetId: string) {
  return this.carnetService.unlockCarnet(userId, carnetId);
}
/*@Put('user/:userId/unlock/:carnetId/place/:placeId')
unlockPlace(
  @Param('userId') userId: string,
  @Param('carnetId') carnetId: string,
  @Param('placeId') placeId: string,
) {
  return this.carnetService.unlockPlace(userId, carnetId, placeId);
}*/
@Put(':userId/unlock/:placeId')
async unlockPlace(
  @Param('userId') userId: string,
  @Param('placeId') placeId: string
) {
  return this.carnetService.unlockPlace(userId, placeId);
}

@Get('exclude/:userId')
async getAllCarnetsExceptUser(@Param('userId') userId: string) {
  return this.carnetService.getAllCarnetsExceptUser(userId);
}
@Get('place/:placeId/owner')
async getOwnerByPlace(@Param('placeId') placeId: string) {
  return this.carnetService.getOwnerByPlace(placeId);
}

@Get('places')
  async getAllPlaces() {
    return this.carnetService.getAllPlaces();
  }
  @Get('place/:placeId')
  async getPlaceById(@Param('placeId') placeId: string) {
    return this.carnetService.getPlaceById(placeId);
  }

  @Put(':id/places/:placeId')
async updatePlace(
  @Param('id') carnetId: string,
  @Param('placeId') placeId: string,
  @Body() updateData: any
) {
  return this.carnetService.updatePlace(carnetId, placeId, updateData);
}
@Get('place/:placeId/carnetid')
async findCarnetIdByPlaceId(@Param('placeId') placeId: string): Promise<string | null> {
  const carnetId = await this.carnetService.findCarnetIdByPlaceId(placeId);
  
  if (!carnetId) {
    throw new NotFoundException('Carnet not found for the given place');
  }

  return carnetId;  // Retourne l'ID du carnet trouvé
}
@Delete(':carnetId/places/:placeId')
async deletePlace(
  @Param('carnetId') carnetId: string,
  @Param('placeId') placeId: string
) {
  return this.carnetService.deletePlace(carnetId, placeId);
}


}
