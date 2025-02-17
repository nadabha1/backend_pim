import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Carnet, CarnetDocument } from './entities/carnet.entity';
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

  async updateCarnet(id: string, data: any): Promise<Carnet> {
    return this.carnetModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteCarnet(id: string): Promise<Carnet> {
    return this.carnetModel.findByIdAndDelete(id).exec();

  
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
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
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

  
}
