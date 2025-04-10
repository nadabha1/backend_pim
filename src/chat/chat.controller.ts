import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ConversationService } from 'src/conversation/conversation.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService, 
    private readonly conversationService: ConversationService
  ) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Get('user/:userId')
async getUserConversations(@Param('userId') userId: string) {
  return this.conversationService.getUserConversations(userId);
}

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
