import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';

@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body: CreateGymDto,
    @CurrentUser() user: AuthUser,
  ) {
    const gym = await this.gymsService.create({
      name: body.name,
      ownerUserId: user.userId,
    });

    return {
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      isActive: gym.isActive,
      createdAt: gym.createdAt,
      updatedAt: gym.updatedAt,
    };
  }
}
