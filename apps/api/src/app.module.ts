import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembershipsModule } from './memberships/memberships.module';
import { TicketPacksModule } from './ticket-packs/ticket-packs.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,       // 👈 registramos Prisma a nivel de app
    MembershipsModule,
    TicketPacksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
