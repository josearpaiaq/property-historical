import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { EventsModule } from './events/events.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PropertiesModule,
    EventsModule,
    AttachmentsModule,
    RemindersModule,
  ],
})
export class AppModule {}
