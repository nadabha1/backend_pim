// src/analyse/analyse.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference } from 'src/preferences/entities/preference.entity';
import axios from 'axios';
import { UserActivity, UserActivityDocument } from './entities/user-activity.entity.ts';

@Injectable()
export class AnalyseIaService {
  private apiKey = 'sk-...'; // Ta clé GPT ici

  constructor(
    @InjectModel(UserActivity.name) private activityModel: Model<UserActivityDocument>,
    @InjectModel(Preference.name) private preferenceModel: Model<any>
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

    return keywords;
  }
}
