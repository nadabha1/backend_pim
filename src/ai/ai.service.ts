import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Carnet, CarnetDocument } from 'src/carnet/entities/carnet.entity';
import { ConfigService } from '@nestjs/config';

type PlaceDocument = Carnet['places'][0] & Document;  // ➤ Type pour reconnaître `_id`

@Injectable()
export class AIService {
  private apiKey: string;

  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('Carnet') private carnetModel: Model<CarnetDocument>,
    private configService: ConfigService
  ) {
    this.apiKey = "sk-Xh3kl2eRQ4IiRKVFNpZWm3OyX4mmvxARpupdoErE0Xfklfwb";
    if (!this.apiKey) {
      throw new Error('La clé API ChatAnywhere est manquante !');
    }
  }

  // ➤ Recommandations basées sur tous les carnets sans filtrer par unlockedCarnets
 /* async getPersonalizedRecommendations(userId: string): Promise<string[]> {
    console.log("===== Début de getPersonalizedRecommendations =====");
    console.log("User ID:", userId);

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      throw new Error('Utilisateur non trouvé');
    }

    console.log("✅ Utilisateur trouvé:", user);

    const userPreferences = user.preferences || [];
    const userCategories = user.preferences || [];  // ➤ Utiliser les préférences comme catégories

    console.log("Préférences de l'utilisateur:", userPreferences);
    console.log("Catégories préférées de l'utilisateur:", userCategories);

    // ➤ Récupérer tous les carnets (sans filtrer par unlockedCarnets)
    const carnets = await this.carnetModel.find().exec();
    console.log("✅ Tous les carnets trouvés:", carnets);

    const recommendedPlaces: { name: string; description: string; carnetTitle: string; categories: string[] }[] = [];

    carnets.forEach(carnet => {
      console.log(`Carnet: ${carnet.title} (ID: ${carnet._id})`);
      carnet.places.forEach(place => {
        console.log(`  ➤ Lieu: ${place.name}, Catégories: ${place.categories}`);
        if (place.categories.some(category => userCategories.includes(category))) {
          recommendedPlaces.push({
            name: place.name,
            description: place.description,
            carnetTitle: carnet.title,
            categories: place.categories
          });
        }
      });
    });

    if (recommendedPlaces.length === 0) {
      console.log("❌ Aucun lieu recommandé trouvé");
      return [];
    }

    console.log("✅ Lieux recommandés:", recommendedPlaces);

    // ➤ Générer des recommandations basées sur les lieux récupérés
    const prompt = `
Je suis une IA qui recommande des lieux et des expériences en fonction des préférences et des catégories suivantes :
- Préférences de l'utilisateur : ${userPreferences.join(', ') || 'aucune préférence'}
- Catégories préférées : ${userCategories.join(', ') || 'aucune catégorie'}
- Lieux recommandés :
${recommendedPlaces.map(p => `- ${p.name} (${p.description}) dans le carnet ${p.carnetTitle} [Catégories: ${p.categories.join(', ')}]`).join('\n')}
Peux-tu me proposer des recommandations personnalisées basées sur ces informations ?`;

    console.log("🛠️ Prompt envoyé à l'IA:", prompt);

    const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Réponse brute de l'IA:", response.data);

    const recommendations = response.data.choices[0].message?.content.split('\n').filter(Boolean) || [];
    console.log("✅ Recommandations générées:", recommendations);

    console.log("===== Fin de getPersonalizedRecommendations =====");
    return recommendations;
  }*/
}
