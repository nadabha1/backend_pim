import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/users/entities/user.entity';
import { PreferenceDocument } from 'src/preferences/entities/preference.entity';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class MatchingService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Preference') private readonly preferenceModel: Model<PreferenceDocument>,
  ) {}

  async matchUserWithDatabase(userId: string): Promise<any[]> {
    const user = await this.userModel.findById(userId).exec();
    const preference = await this.preferenceModel.findOne({ user: userId }).exec();

    if (!user) throw new Error('User not found');

     console.log('🧠 tags:', user.tags);
     console.log('🧠 searchHistory:', user.searchHistory);
    console.log('🧠 preference:', preference);

    const userProfile = this.buildUserProfile(user, preference);

    const otherUsers = await this.userModel.find({ _id: { $ne: userId } }).exec();

    const candidates = await Promise.all(
      otherUsers.map(async (other) => {
        const pref = await this.preferenceModel.findOne({ user: other._id }).exec();
        const profile = this.buildUserProfile(other, pref);
        console.log(`💬 Profil de ${other.name}:`, profile);
        return {
          id: other._id.toString(),
          name: other.name,
          profileImage: other.profileImage,
          tags: profile, // ← utilisé dans le modèle Python
        };
      })
    );

    const result = await this.matchUsers(userProfile, candidates);
    // 🔁 Reprendre la photo de profil depuis les candidats originaux
let enrichedResult = result.map(match => {
  const original = candidates.find(c => c.id === match.id);
  return {
    ...match,
    profileImage: original?.profileImage || null,
  };
});

    let filteredResult = enrichedResult.filter(match => match.score > 0.5);
    if (filteredResult.length === 0) {
      // Sort by highest score
      filteredResult = result
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Take top 3 matches
    }
    return filteredResult;
  }

  async matchUser(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    const preference = await this.preferenceModel.findOne({ user: userId }).exec();

    if (!user) throw new Error('User not found');

    const profileText = this.buildUserProfile(user, preference);
    console.log('Profil complet pour matching:', profileText);
    return { profile: profileText };
  }

  buildUserProfile(user: any, preference: any): string {
    const tags = user.tags || [];
    const activities = preference?.favoriteActivities || [];
    const events = preference?.eventPreferences || [];
    const time = preference?.preferredEventTime || '';
    const social = preference?.socialPreference || '';

    const all = [
      ...tags,
      ...activities,
      ...events,
      time,
      social,
    ];

    const profile = [...new Set(all.map(w => w?.toLowerCase().trim()))]
      .filter(Boolean)
      .join(' ');

    console.log(`🧠 Profil généré pour ${user.name || user._id}:`, profile);

    return profile;
  }

  async matchUsers(userProfile: string, candidates: { id: string; name: string; tags: string }[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const pythonPath = 'python';
      const scriptPath = path.join(__dirname, '../../src/script/match_users.py');

      const pythonProcess = spawn(pythonPath, [scriptPath]);

      const input = JSON.stringify({ user: userProfile, candidates });
      let result = '';
      let error = '';

      pythonProcess.stdin.write(input);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0 || error) {
          reject(new Error(error || `Python exited with code ${code}`));
        } else {
          try {
            resolve(JSON.parse(result));
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  }
}
