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
    @InjectModel('Preference') private preferenceModel: Model<any>,
    private configService: ConfigService
  ) {
    this.apiKey = "";
    if (!this.apiKey) {
      throw new Error('La clé API ChatAnywhere est manquante !');
    }
  }

    async getBehaviorBasedRecommendations(userId: string): Promise<string[]> {
      const user = await this.userModel.findById(userId).exec();
      if (!user) throw new Error('Utilisateur non trouvé');
    
      const searchTerms = user.searchHistory || [];
      const unlockedPlaceIds = user.unlockedPlaces || [];
    
      // Récupère les lieux débloqués
      const carnets = await this.carnetModel.find({ "places._id": { $in: unlockedPlaceIds } }).exec();
    
      const unlockedPlaces = [];
      for (const carnet of carnets) {
        carnet.places.forEach(place => {
          if (unlockedPlaceIds.includes(place._id.toString())) {
            unlockedPlaces.push(place);
          }
        });
      }
    
      if (searchTerms.length === 0 && unlockedPlaces.length === 0) {
        return ['Aucune donnée comportementale pour générer des recommandations.'];
      }
    
      const prompt = `
    Tu es une IA spécialisée dans la personnalisation de contenu touristique.
    
    Voici l’historique des recherches du user : ${searchTerms.join(', ')}
    
    Voici les lieux qu’il a déjà débloqués :
    ${unlockedPlaces.map(p => `- ${p.name} (${p.description})`).join('\n')}
    
    Sur cette base, recommande-lui des lieux à découvrir qui pourraient lui plaire.
    Utilise un ton amical et dynamique.
    `;
    
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
    
      const recommendations = response.data.choices[0].message?.content.split('\n').filter(Boolean) || [];
      return recommendations;
    }
    async getBehaviorBasedRecommendationsv3(userId: string): Promise<{ recommendations: string[], lockedPlaces: any[] }> {
      console.log("===== 📥 Début de getBehaviorBasedRecommendationsv3 =====");
      console.log("🔍 User ID reçu :", userId);
    
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        console.log("❌ Utilisateur introuvable.");
        throw new Error('Utilisateur non trouvé');
      }
    
      console.log("✅ Utilisateur trouvé :", user.name);
      const searchTerms = user.searchHistory || [];
      const unlockedPlaceIds = user.unlockedPlaces.map(id => id.toString()) || [];
    
      console.log("🔎 Historique de recherche :", searchTerms);
      console.log("🔓 Lieux débloqués :", unlockedPlaceIds);
    
      const carnets = await this.carnetModel.find().exec();
      console.log(`📘 Carnets récupérés (${carnets.length})`);
    
      const allPlaces = carnets.flatMap(c => c.places);
      console.log(`📍 Total des lieux trouvés : ${allPlaces.length}`);
    
      const relevantPlaces = allPlaces.filter(place => {
        const matchesSearch = place.categories?.some(cat =>
          searchTerms.includes(cat.toLowerCase())
        );
        const isUnlocked = unlockedPlaceIds.includes(place._id.toString());
        return matchesSearch || isUnlocked;
      });
    
      console.log(`✅ Lieux pertinents trouvés : ${relevantPlaces.length}`);
    
      const unlocked = relevantPlaces.filter(p =>
        unlockedPlaceIds.includes(p._id.toString())
      );
    
      const locked = relevantPlaces.filter(p =>
        !unlockedPlaceIds.includes(p._id.toString())
      );
    
      console.log(`🔓 Lieux débloqués pertinents : ${unlocked.length}`);
      console.log(`🔒 Lieux à débloquer pertinents : ${locked.length}`);
    
      const prompt = `
    Tu es une IA qui recommande des lieux à visiter.
    
    Voici ce que le user a recherché : ${searchTerms.join(', ') || 'aucune recherche'}
    
    Voici les lieux déjà débloqués :
    ${unlocked.map(p => `- ${p.name} (${p.description})`).join('\n')}
    
    Voici d'autres lieux qui pourraient l'intéresser :
    ${locked.map(p => `- ${p.name} (${p.description})`).join('\n')}
    
    Fais une liste de recommandations personnalisées pour des lieux à découvrir.
    Utilise un ton positif et adapté au tourisme.
      `;
    
      console.log("🧠 Prompt envoyé à l'IA :", prompt);
    
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
    
      console.log("🤖 Réponse brute de l'IA :", response.data);
    
      const recommendations = response.data.choices[0].message?.content
        .split('\n')
        .filter(line => line.trim()) || [];
    
      const lockedPlaces = locked.map(place => ({
        id: place._id,
        name: place.name,
        description: place.description,
        categories: place.categories,
        unlockCost: place.unlockCost
      }));
    
      console.log("✅ Recommandations générées :", recommendations);
      console.log("✅ Lieux verrouillés formatés :", lockedPlaces);
      console.log("===== ✅ Fin de getBehaviorBasedRecommendationsv3 =====");
    
      return {
        recommendations,
        lockedPlaces
      };
    }
    
    async getFilteredPlacesByUserSearch(userId: string): Promise<{
      accessiblePlaces: any[],
      lockedPlaces: any[]
    }> {
      console.log("🚀 Début getFilteredPlacesByUserSearch");
      const user = await this.userModel.findById(userId).exec();
      if (!user) throw new Error("Utilisateur non trouvé");
    
      const searchTerms = user.searchHistory || [];
      const unlockedPlaceIds = user.unlockedPlaces.map(id => id.toString());
    
      console.log("🔎 Recherches :", searchTerms);
      console.log("🔓 Lieux débloqués :", unlockedPlaceIds);
    
      // Récupérer toutes les places
      const carnets = await this.carnetModel.find().exec();
      const allPlaces = carnets.flatMap(c => c.places);
    
      // Filtrer celles qui matchent les recherches
      const matchingPlaces = allPlaces.filter(place =>
        place.categories?.some(cat =>
          searchTerms.includes(cat.toLowerCase())
        )
      );
    
      console.log("✅ Places correspondantes aux recherches :", matchingPlaces.length);
    
      const accessiblePlaces = [];
      const lockedPlaces = [];
    
      matchingPlaces.forEach(place => {
        const isUnlocked = unlockedPlaceIds.includes(place._id.toString());
        const baseInfo = {
          id: place._id,
          name: place.name,
          description: place.description,
          categories: place.categories,
        };
    
        if (isUnlocked) {
          accessiblePlaces.push(baseInfo);
        } else {
          lockedPlaces.push({
            ...baseInfo,
            unlockCost: place.unlockCost
          });
        }
      });
    
      console.log("🔓 Accessible :", accessiblePlaces.length);
      console.log("🔒 Locked :", lockedPlaces.length);
    
      return {
        accessiblePlaces,
        lockedPlaces
      };
    }
    
    async getFilteredPlacesByUserSearchv2(userId: string): Promise<{
      accessiblePlaces: any[],
      lockedPlaces: any[]
    }> {
      console.log("===== 🚀 Début de getFilteredPlacesByUserSearch =====");
      console.log("👤 User ID reçu :", userId);
    
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        console.log("❌ Utilisateur non trouvé !");
        throw new Error("Utilisateur non trouvé");
      }
    
      console.log("✅ Utilisateur trouvé :", user.name);
    
      const unlockedPlaceIds = user.unlockedPlaces.map(id => id.toString());
      const searchTerms = user.searchHistory || [];
    
      console.log("🔎 searchHistory :", searchTerms);
      console.log("🔓 Places débloquées :", unlockedPlaceIds);
    
      // ➕ Étape 1 : Charger les préférences utilisateur
      const preference = await this.preferenceModel.findOne({ user: userId }).exec();
    
      let preferenceTerms: string[] = [];
    
      if (preference) {
        const favActivities = preference.favoriteActivities || [];
        const eventPrefs = (preference.eventPreferences || []).map(e => {
          return typeof e === 'string' ? e : e.name || e.title || JSON.stringify(e);
        });
    
        preferenceTerms = [...favActivities, ...eventPrefs];
        console.log("💡 Préférences trouvées :", preferenceTerms);
      } else {
        console.log("⚠️ Aucune préférence enregistrée pour ce user.");
      }
    
      const keywords = [...searchTerms, ...preferenceTerms].map(k => k.toLowerCase());
      console.log("🧠 Mots-clés utilisés pour le matching :", keywords);
    
      // ➤ Étape 2 : Récupérer toutes les places des carnets
      const carnets = await this.carnetModel.find().exec();
      console.log(`📘 Nombre de carnets récupérés : ${carnets.length}`);
    
      const allPlaces = carnets.flatMap(c => c.places);
      console.log(`📍 Nombre total de places trouvées : ${allPlaces.length}`);
    
      const matchingPlaces = allPlaces.filter(place =>
        place.categories?.some(cat =>
          keywords.includes(cat.toLowerCase())
        )
      );
    
      console.log(`🎯 Nombre de places correspondant aux mots-clés : ${matchingPlaces.length}`);
    
      const accessiblePlaces = [];
      const lockedPlaces = [];
    
      matchingPlaces.forEach(place => {
        const isUnlocked = unlockedPlaceIds.includes(place._id.toString());
        const baseInfo = {
          id: place._id,
          name: place.name,
          description: place.description,
          categories: place.categories,
        };
    
        if (isUnlocked) {
          accessiblePlaces.push(baseInfo);
        } else {
          lockedPlaces.push({ ...baseInfo, unlockCost: place.unlockCost });
        }
      });
    
      console.log(`✅ Places accessibles : ${accessiblePlaces.length}`);
      console.log(`🔒 Places verrouillées : ${lockedPlaces.length}`);
      console.log("===== ✅ Fin de getFilteredPlacesByUserSearch =====");
    
      return {
        accessiblePlaces,
        lockedPlaces
      };
    }

    async generateImage(prompt: string): Promise<string> {
      try {
        const response = await axios.post(
'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
          { inputs: prompt },
          {
            headers: {
              Authorization: `Bearer `, // ton vrai token ici
              Accept: 'application/json',
            },
            responseType: 'arraybuffer', // pour récupérer l'image brute
          }
        );
    
        const imageBuffer = Buffer.from(response.data, 'binary');
        return imageBuffer.toString('base64');
      } catch (error) {
        const errorMsg = error.response?.data
          ? Buffer.from(error.response.data).toString('utf-8')
          : error.message;
    
        console.error('❌ Erreur HuggingFace:', errorMsg);
        throw new Error('Erreur lors de la génération de l’image');
      }
    }
    
    async generateImage2(prompt: string): Promise<string> {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
        { inputs: prompt },
        {
          headers: {
            Authorization: 'Bearer ', // Remplacez par votre token Hugging Face
            Accept: 'application/json',
          },
          responseType: 'arraybuffer', // pour récupérer l'image brute
        }
      );
    
      const imageBuffer = Buffer.from(response.data, 'binary');
      return imageBuffer.toString('base64'); // à envoyer à Flutter
    }
    
    
}
