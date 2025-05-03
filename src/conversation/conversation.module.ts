import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation, ConversationSchema } from './entities/conversation.entity';
import { MessageModule } from 'src/message/message.module';  // ✅ Corriger l'import si nécessaire
import { NotificationModule } from 'src/notification/notification.module';  // ✅ Corriger l'import si nécessaire
import { User, UserSchema } from 'src/users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Conversation', schema: ConversationSchema },
      { name: User.name, schema: UserSchema }, // 🟢 Ajoute User ici

    ]),
    forwardRef(() => MessageModule),  // ✅ Utiliser forwardRef
    forwardRef(() => NotificationModule),  // ✅ Utiliser forwardRef
  ],
  controllers: [ConversationController],
  providers: [ConversationService], // ✅ Ensure ConversationService is provided
  exports: [ConversationService, MongooseModule], // ✅ Export ConversationService
})
export class ConversationModule {}
