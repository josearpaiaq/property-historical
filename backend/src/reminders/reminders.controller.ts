import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get('properties/:propertyId/reminders')
  findAllByProperty(
    @CurrentUser() user: AuthUser,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
  ) {
    return this.remindersService.findAllByProperty(user.id, propertyId);
  }

  @Post('properties/:propertyId/reminders')
  create(
    @CurrentUser() user: AuthUser,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.create(user.id, propertyId, dto);
  }

  @Put('reminders/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user.id, id, dto);
  }

  @Delete('reminders/:id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.remindersService.remove(user.id, id);
  }

  @Post('reminders/:id/complete')
  complete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { completedAt?: string },
  ) {
    return this.remindersService.complete(user.id, id, body?.completedAt);
  }
}
