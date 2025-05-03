import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference } from './entities/preference.entity';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<Preference>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // Création d'une nouvelle préférence
  async create(createPreferenceDto: CreatePreferenceDto) {
    const createdPreference = new this.preferenceModel(createPreferenceDto);
    return createdPreference.save();
    
  }
  
  async findMatchingUsers(currentPrefs) {
    const allPrefs = await this.preferenceModel.find({ user: { $ne: currentPrefs.user } }).populate('user');
  
    return allPrefs
      .filter(p =>
        p.favoriteActivities.some(act => currentPrefs.favoriteActivities.includes(act)) ||
        p.eventPreferences.some(ev => currentPrefs.eventPreferences.includes(ev)) ||
        p.socialPreference === currentPrefs.socialPreference ||
        p.preferredEventTime === currentPrefs.preferredEventTime
      )
      .map(p => p.user); // retourne juste les utilisateurs
  }
  async generateTagsFromPreferences(userId: string): Promise<void> {
    console.log("generating tags for user " + userId);
    const preferences = await this.preferenceModel.findOne({ user: userId });

    if (!preferences) 
      throw new NotFoundException('User preferences not found');

    const tags = new Set<string>();

    // 🎯 Analyser les préférences et ajouter des tags
    preferences.favoriteActivities.forEach(activity => {
      if (activity.toLowerCase().includes('sport')) tags.add('Sport');
      if (activity.toLowerCase().includes('musée') || activity.toLowerCase().includes('culture'))
        tags.add('Culture');
      if (activity.toLowerCase().includes('camping') || activity.toLowerCase().includes('nature'))
        tags.add('Nature');
      if (activity.toLowerCase().includes('shopping')) tags.add('Shopping');
    });

    preferences.eventPreferences.forEach(event => {
      if (event.toLowerCase().includes('tech')) tags.add('Technologie');
      if (event.toLowerCase().includes('music')) tags.add('Musique');
      if (event.toLowerCase().includes('art')) tags.add('Art');
    });

    // Social preferences
    if (preferences.socialPreference === 'Large Gatherings') tags.add('Extrovert');
    if (preferences.socialPreference === 'Small Groups') tags.add('Introvert');

    // Time preferences
    if (preferences.preferredEventTime === 'Morning') tags.add('Matinal');
    if (preferences.preferredEventTime === 'Afternoon') tags.add('Actif en journée');
    if (preferences.preferredEventTime === 'Evening') tags.add('Nocturne');

    // ✅ Sauvegarder les tags dans le user
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { tags: Array.from(tags) }
    });
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

  // Suppression des préférences associées à un utilisateur
  async deletePreferencesByUser(userId: string): Promise<void> {
    await this.preferenceModel.deleteOne({ user: userId }).exec();
  }
}
