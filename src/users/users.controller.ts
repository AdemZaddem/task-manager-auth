import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private userService:UsersService){}
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('ADMIN')
    @Get()
    findAll(){
        return this.userService.findAll()
    }
}
