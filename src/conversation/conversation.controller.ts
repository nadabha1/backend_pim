import { Body, Controller, Get, InternalServerErrorException, Param, Post, Req } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

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

  @Post(':userId')
  async createConversation(@Param('userId') userId: string, @Body('otherUserId') otherUserId: string) {
  return await this.conversationService.createConversation2(userId, otherUserId);}

  

}
