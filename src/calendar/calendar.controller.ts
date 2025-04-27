import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly userService: UsersService) {}

  @Post('save-availability')
  async saveAvailability(@Body() body: any) {
    const { userId, availability } = body;
    await this.userService.updateAvailability(userId, availability);
    return { message: 'Disponibilités enregistrées' };
  }
}
