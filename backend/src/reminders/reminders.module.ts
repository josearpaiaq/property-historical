import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { PropertiesModule } from '../properties/properties.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PropertiesModule, EventsModule],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
