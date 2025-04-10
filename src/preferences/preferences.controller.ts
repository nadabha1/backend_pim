import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  // Créer une nouvelle préférence
  @Post()
  async create(@Body() createPreferenceDto: CreatePreferenceDto) {
    const preference = await this.preferencesService.create(createPreferenceDto);
    console.log('Create preference ' + createPreferenceDto.user);
    this.preferencesService.generateTagsFromPreferences(createPreferenceDto.user);
    return preference;
  }
  @Patch("/updatePref/:userId")
  async up(@Param('userId') createPreferenceDto: string) {
    return this.preferencesService.generateTagsFromPreferences(createPreferenceDto);
  }

  // GET /preferences/matching/:userId
@Get('matching/:userId')
async getMatchingUsers(@Param('userId') userId: string) {
  const currentPrefs = await this.preferencesService.findByUserId(userId);

  const users = await this.preferencesService.findMatchingUsers(currentPrefs);
  return users;
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
