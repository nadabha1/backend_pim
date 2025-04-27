import { isArray, IsMongoId } from "class-validator";
import { Types } from "mongoose";

export class CreateConversationDto {
    @IsMongoId({ each: true })
    participants: string[];
}
