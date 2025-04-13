// src/analyse/analyse.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference } from 'src/preferences/entities/preference.entity';
import axios from 'axios';
import { UserActivity, UserActivityDocument } from './entities/user-activity.entity.ts';
import { Cron, CronExpression } from '@nestjs/schedule';
// Corrigé :
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AnalyseIaService {
   private apiKey = "sk-Xh3kl2eRQ4IiRKVFNpZWm3OyX4mmvxARpupdoErE0Xfklfwb";
   private readonly logger = new Logger(AnalyseIaService.name);

  constructor(
    @InjectModel(UserActivity.name) private activityModel: Model<UserActivityDocument>,
    @InjectModel(Preference.name) private preferenceModel: Model<any>,
    private readonly usersService: UsersService
  ) {}

  async logActivity(userId: string, type: string, value: string) {
    await this.activityModel.create({ userId, type, value });
  }

  async analyseUser(userId: string): Promise<string[]> {
    const activities = await this.activityModel.find({ userId }).exec();

    const log = activities.map(act => `- [${act.type}] ${act.value}`).join('\n');

    const prompt = `
Voici les dernières activités d'un utilisateur :
${log}

Déduis à partir de ces actions quelles sont ses préférences principales en 3 mots clés. Ne réponds que par la liste.
`;

    const res = await axios.post(
      'https://api.chatanywhere.tech/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const keywords = res.data.choices[0].message.content
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean);

    // Update preferences
    await this.preferenceModel.updateOne(
      { user: userId },
      { $set: { favoriteActivities: keywords } },
      { upsert: true }
    );
    await this.activityModel.deleteMany({ userId });


    return keywords;
  }

  // ⚙️ CRON JOB - Exécuter chaque jour à minuit (modifiable)

  async analyseAllUsers(): Promise<void> {
    this.logger.log('🟡 Démarrage de l\'analyse automatique des profils...');
    const users = await this.usersService.getAllUsers();

    for (const user of users) {
      const prefs = await this.analyseUser(user._id.toString());
      this.logger.log(`🟢 Préférences pour ${user.email}: ${prefs.join(', ')}`);
    }

    this.logger.log('✅ Analyse terminée pour tous les utilisateurs.');
  }

  // Exécuter tous les jours à minuit
  @Cron(CronExpression.EVERY_12_HOURS)
  async handleCron() {
    console.log('analyse done')
    await this.analyseAllUsers();
  }

}
