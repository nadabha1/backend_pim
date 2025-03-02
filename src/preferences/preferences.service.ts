import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference } from './entities/preference.entity';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<Preference>,
  ) {}

  // Création d'une nouvelle préférence
  async create(createPreferenceDto: CreatePreferenceDto) {
    const createdPreference = new this.preferenceModel(createPreferenceDto);
    return createdPreference.save();
  }

  // Récupération de toutes les préférences
  async findAll() {
    return this.preferenceModel.find().exec();
  }

  // Récupération d'une préférence par son ID
  async findOne(id: string) {
    const preference = await this.preferenceModel.findById(id).exec();
    if (!preference) {
      throw new NotFoundException(`Preference with ID ${id} not found`);
    }
    return preference;
  }

  // Récupérer les préférences d'un utilisateur par son ID
  async findByUserId(userId: string) {
    const preference = await this.preferenceModel
      .findOne({ user: userId })
      .exec();
    if (!preference) {
      throw new NotFoundException(`Preference for user with ID ${userId} not found`);
    }
    return preference;
  }

  // Mise à jour des préférences d'un utilisateur
  async update(id: string, updatePreferenceDto: UpdatePreferenceDto) {
    const updatedPreference = await this.preferenceModel
      .findByIdAndUpdate(id, updatePreferenceDto, { new: true })
      .exec();
    if (!updatedPreference) {
      throw new NotFoundException(`Preference with ID ${id} not found`);
    }
    return updatedPreference;
  }

  // Suppression d'une préférence par son ID
  async remove(id: string) {
    const deletedPreference = await this.preferenceModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedPreference) {
      throw new NotFoundException(`Preference with ID ${id} not found`);
    }
    return { message: `Preference with ID ${id} has been deleted` };
  }
}
