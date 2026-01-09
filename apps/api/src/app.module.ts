import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembershipsModule } from './memberships/memberships.module';
import { TicketPacksModule } from './ticket-packs/ticket-packs.module';
import { PrismaModule } from './prisma/prisma.module';
import { GymsModule } from './gyms/gyms.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,       // 👈 registramos Prisma a nivel de app
    MembershipsModule,
    TicketPacksModule,
    GymsModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
