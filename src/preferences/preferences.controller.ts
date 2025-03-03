import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  // Créer une nouvelle préférence
  @Post()
  create(@Body() createPreferenceDto: CreatePreferenceDto) {
    return this.preferencesService.create(createPreferenceDto);
  }

  // Récupérer toutes les préférences
  @Get()
  findAll() {
    return this.preferencesService.findAll();
  }

  // Récupérer une préférence spécifique par son ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preferencesService.findOne(id);
  }

  // Récupérer les préférences d'un utilisateur par son ID
  @Get('user/:userId')
  findPreferencesByUserId(@Param('userId') userId: string) {
    return this.preferencesService.findByUserId(userId);
  }

  // Mettre à jour une préférence par son ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePreferenceDto: UpdatePreferenceDto) {
    return this.preferencesService.update(id, updatePreferenceDto);
  }

  // Supprimer une préférence par son ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preferencesService.remove(id);
  }
}
