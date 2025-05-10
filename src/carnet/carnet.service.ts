import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Carnet, CarnetDocument, Place } from './entities/carnet.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class CarnetService {
  constructor(@InjectModel(Carnet.name) private carnetModel: Model<CarnetDocument>,
  @InjectModel(User.name) private userModel: Model<UserDocument> // FIXED: Inject User Model

) {}
async addPlace(carnetId: string, placeData: any): Promise<Carnet> {
  const carnet = await this.carnetModel.findById(carnetId);
  if (!carnet) {
    throw new NotFoundException('Carnet not found');
  }

  console.log(`Carnet found: ${carnet.title}`);
  console.log(`Place Data Received:`, placeData);

  carnet.places.push(placeData);
   // Reward creator with 5 coins
   const creatorObjectId = carnet.owner; // Assuming 'owner' field in 'carnet' holds the creator's ObjectId
   const user = await this.userModel.findById(creatorObjectId);
   if (user) {
     user.coins = (user.coins || 0) + 5;
     await user.save();
   } else {
     throw new Error('Creator not found');
   }
  
  return await carnet.save();
}

  async createCarnet(data: any): Promise<Carnet> {
    const newCarnet = new this.carnetModel(data);
   
    return newCarnet.save();
  }
 /* async unlockPlace(userId: string, carnetId: string, placeIndex: number): Promise<any> {
    const carnet = await this.carnetModel.findById(carnetId);
    const user = await this.userModel.findById(userId);
  
    if (!carnet || !user) throw new NotFoundException('Carnet or User not found');
  
    if (!carnet.unlockedPlaces[userId]) {
      carnet.unlockedPlaces[userId] = [];
    }
  
    // Check if already unlocked
    if (carnet.unlockedPlaces[userId].includes(placeIndex)) {
      throw new BadRequestException('Place already unlocked');
    }
  
    if (user.coins < 5) {
      throw new BadRequestException('Not enough Coins');
    }
  
    // Deduct coins and unlock the place
    user.coins -= 5;
    carnet.unlockedPlaces[userId].push(placeIndex);
  
    await user.save();
    await carnet.save();
  
    return { message: 'Place unlocked successfully', coins: user.coins };
  }
 */
  async getUserCarnet(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
  
    if (!user.carnetId) {
      console.log(`User ${userId} does not have a carnet`);
      return { hasCarnet: false };
    }
  
    const carnet = await this.carnetModel.findById(user.carnetId);

    return { hasCarnet: true, carnet };
  }
  async createCarnetForUser(userId: string, title: string): Promise<Carnet> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
  
    console.log(`User found: ${user.email}, CarnetId: ${user.carnetId}`);
  
    if (user.carnetId) {
      console.log("User already has a carnet, creation aborted");
      throw new BadRequestException('User already has a carnet');
    }
  
    console.log("Creating a new carnet...");
    const newCarnet = new this.carnetModel({ title, owner: userId, places: [] });
    await newCarnet.save();
   // Reward creator with 10 coins
   const creatorObjectId = user; // Assuming 'owner' field in 'data' holds the creator's ObjectId
   if (user) {
     user.coins = (user.coins || 0) + 10;
     await user.save();
   } else {
     throw new Error('Creator not found');
   }
    user.carnetId = newCarnet.id;
    await user.save();
    console.log(`Carnet created successfully for user ${userId}`);
  
    return newCarnet;
  }
  
  async addPlaceToUserCarnet(userId: string, placeData: any): Promise<Carnet> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.carnetId) throw new NotFoundException('User or carnet not found');
  
    const carnet = await this.carnetModel.findById(user.carnetId);
    carnet.places.push(placeData);
    return await carnet.save();
  }
  

  async getAllCarnets(): Promise<Carnet[]> {
    return this.carnetModel.find().populate('owner').exec();
  }
async getCarnetByUserId(userId: string): Promise<Carnet | null> {
  return this.carnetModel.findOne({ owner: userId }).exec();
}

  async getCarnetById(id: string): Promise<Carnet> {
    const carnet = await this.carnetModel.findById(id);
    if (!carnet) throw new NotFoundException('Carnet not found');
    return carnet;
  }

  async updateCarnet(carnetId: string, updateData: any): Promise<Carnet> {
    const carnet = await this.carnetModel.findByIdAndUpdate(carnetId, updateData, { new: true }).exec();
    if (!carnet) {
      throw new NotFoundException('Carnet not found');
    }
    return carnet;
  }
  
  async deleteCarnet(carnetId: string, userId: string): Promise<void> {
    // 🗑 Supprimer le carnet
    const carnet = await this.carnetModel.findByIdAndDelete(carnetId);
    if (!carnet) {
      throw new NotFoundException('Carnet introuvable');
    }

    // 🧹 Supprimer le carnetId dans l'entité User
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { carnetId: '' }, // 🗑 Supprime la référence du carnet
    });
  } 
  
  
//tesssttt
  async unlockCarnet(userId: string, carnetId: string): Promise<{ message: string; coins: number }> {
    const user = await this.userModel.findById(userId);
    const carnet = await this.carnetModel.findById(carnetId);
  
    if (!user || !carnet) {
      throw new NotFoundException('Utilisateur ou carnet introuvable');
    }
  
    if (user.unlockedCarnets.includes(carnetId)) {
      throw new BadRequestException('Carnet déjà débloqué');
    }
  
    if (user.coins < 5) {
      throw new BadRequestException('Fonds insuffisants pour débloquer ce carnet');
    }
  
    // Déduire 5 coins et débloquer le carnet
    user.coins -= 5;
    user.unlockedCarnets.push(carnetId);
  
    await user.save();
  
    return { message: 'Carnet débloqué avec succès', coins: user.coins };
  }
  /*async unlockPlace(userId: string, carnetId: string, placeId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    const carnet = await this.carnetModel.findById(carnetId);
  
    if (!user || !carnet) {
      throw new NotFoundException('Utilisateur ou carnet introuvable');
    }
  
    // Vérifier si l'utilisateur a déjà débloqué ce lieu
    if (user.unlockedPlaces.includes(placeId)) {
      throw new BadRequestException('Lieu déjà débloqué');
    }
  
    // Vérifier si l'utilisateur a assez de coins
    if (user.coins < 5) {
      throw new BadRequestException('Pas assez de coins');
    }
  
    // Déduire 5 coins et ajouter le lieu débloqué
    user.coins -= 5;
    user.unlockedPlaces.push(placeId);
  
    await user.save();
  
    return { message: 'Lieu débloqué avec succès', coins: user.coins };
  }*/
    async unlockPlace(userId: string, placeId: string) {
      // Vérifier si l'utilisateur existe
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      // Vérifier si le lieu existe avant de l'ajouter
      const placeExists = await this.carnetModel.findOne({ 'places._id': placeId });
      if (!placeExists) {
        throw new NotFoundException('Place not found');
      }
    
      // Vérifier si l'utilisateur a déjà débloqué ce lieu
      if (!user.unlockedPlaces.includes(placeId)) {
        user.unlockedPlaces.push(placeId);
        await user.save();
      }
    
      return { message: 'Place unlocked successfully' };
    }
    
    
    async getAllCarnetsExceptUser(userId: string): Promise<Carnet[]> {
      // Find all carnets except the one owned by the user
      return this.carnetModel.find({ owner: { $ne: userId } }).exec();
    }

async getOwnerByPlace(placeId: string): Promise<string | null> {
  const placeObjectId = new Types.ObjectId(placeId); // Conversion en ObjectId
  const carnet = await this.carnetModel.findOne({ "places._id": placeObjectId }).exec();
  if (carnet) {
    return carnet.owner.toString();
  }
  return null;
}

async getAllPlaces(): Promise<any[]> {
  try {
    // Fetch all Carnets with their places
    const carnets = await this.carnetModel.find({}, 'places').exec();

    if (!carnets || carnets.length === 0) {
      throw new NotFoundException('No carnets found');
    }

    // Flatten the places from all carnets into a single array
    const allPlaces = carnets.flatMap(carnet => carnet.places);
    return allPlaces;
  } catch (error) {
    console.error('Error retrieving places:', error); // Log any error
    throw new InternalServerErrorException('Error retrieving places');
  }
}
async getPlaceById(placeId: string): Promise<any> {
  // Find a carnet that contains the place with the given placeId
  const carnet = await this.carnetModel.findOne({ 'places._id': placeId }).exec();

  if (!carnet) {
    throw new NotFoundException('Place not found');
  }

  // Retrieve the place data from the places array by its placeId
  const place = carnet.places.find(p => (p as any)._id.toString() === placeId);
  
  if (!place) {
    throw new NotFoundException('Place not found');
  }

  return place;
}


async updatePlace(carnetId: string, placeId: string, updateData: any): Promise<any> {
  const carnet = await this.carnetModel.findById(carnetId);
  if (!carnet) throw new NotFoundException('Carnet not found');

  const placeIndex = carnet.places.findIndex(p => (p as any)._id.toString() === placeId);
  if (placeIndex === -1) throw new NotFoundException('Place not found');

  // Appliquer les modifications à la place
  Object.assign(carnet.places[placeIndex], updateData);

  await carnet.save();
  return carnet.places[placeIndex];
}

async findCarnetIdByPlaceId(placeId: string): Promise<string | null> {
  const placeObjectId = new Types.ObjectId(placeId); // Conversion en ObjectId
  const carnet = await this.carnetModel.findOne({ "places._id": placeObjectId }).exec();
  if (carnet) {
    return carnet.id;  // Retourne l'ID du carnet
  }
  return null;  // Retourne null si aucun carnet n'est trouvé
}

async deletePlace(carnetId: string, placeId: string): Promise<Carnet> {
  const carnet = await this.carnetModel.findById(carnetId);
  if (!carnet) {
    throw new NotFoundException('Carnet not found');
  }

  // Find the index of the place to be deleted
  const placeIndex = carnet.places.findIndex((p) => (p as any)._id.toString() === placeId);
  if (placeIndex === -1) {
    throw new NotFoundException('Place not found');
  }

  // Remove the place from the carnet's places array
  carnet.places.splice(placeIndex, 1);

  await carnet.save();
  return carnet;
}

 // Recherche des places dans un carnet par catégorie
 async getPlacesByCategory(category: string): Promise<Place[]> {
  const carnet = await this.carnetModel.findOne({
    'places.categories': category, // Recherche de places avec la catégorie donnée
  }).exec();
  
  if (!carnet) {
    return []; // Si aucun carnet trouvé, retourner un tableau vide
  }

  return carnet.places.filter(place => place.categories.includes(category));
}

// Recherche des places dans un carnet par plusieurs catégories
async getPlacesByCategories(categories: string[]): Promise<Place[]> {
  const carnet = await this.carnetModel.findOne({
    'places.categories': { $in: categories }, // Recherche des places qui ont l'une des catégories spécifiées
  }).exec();

  if (!carnet) {
    return []; // Si aucun carnet trouvé, retourner un tableau vide
  }

  return carnet.places.filter(place => 
    place.categories.some(category => categories.includes(category))
  );
}
async getTotalRatingForTraveler(userId: string): Promise<number> {
  const carnet = await this.carnetModel.findOne({ owner: userId }).exec();
  if (!carnet || carnet.places.length === 0) {
    return 0;
  }

  const total = carnet.places.reduce((sum, place) => sum + (place.averageRating || 0), 0);
  const average = total / carnet.places.length;
  return parseFloat(average.toFixed(2)); // arrondi à 2 chiffres
}

async updateGlobalRating(carnetId: string) {
  const carnet = await this.carnetModel.findById(carnetId).populate('places').exec();
  if (!carnet) {
    throw new Error('Carnet not found');
  }

  const totalRatings = carnet.places.reduce((sum, place) => sum + place.averageRating, 0);
  const globalAverageRating = carnet.places.length > 0 ? totalRatings / carnet.places.length : 0;

  // Mettre à jour la note globale du carnet
  carnet.globalAverageRating = globalAverageRating;
  await carnet.save();
}

}
