import { Body, Controller, Get, InternalServerErrorException, Param, Post, Req, BadRequestException } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Types } from 'mongoose';

class CreateGroupDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  participants: string[];

  @IsString()
  @IsNotEmpty()
  title: string;
}

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
 
  @Post('/group')
  async createGroup(@Body() data: { participants: string[]; title: string }) {
    console.log("Données reçues dans createGroup:", data);
    return await this.conversationService.createConversationGroupnotevent(data);
  }
  @Post(':userId')
    async createConversation(@Param('userId') userId: string, @Body('otherUserId') otherUserId: string) {
    return await this.conversationService.createConversationavecnot(userId, otherUserId);}

    @Get('/name/:userId')
  async getUserConversationsname(@Param('userId') userId: string) {
    return this.conversationService.getUserConversationsname(userId);
  }
  
  @Get(':userId')
  async getUserConversations(@Param('userId') userId: string) {
    return this.conversationService.getUserConversations(userId);
  } 

  /*@Post()
  async createConversation(@Body() body: CreateConversationDto) {
    console.log("🔹 Requête reçue:", body);
  
    try {
      const newConversation = await this.conversationService.createConversation(body.participants);
      return newConversation;
    } catch (error) {
      console.error("❌ Erreur lors de la création de la conversation:", error);
      throw new InternalServerErrorException(error.message);
    }
  }*/

   

}
