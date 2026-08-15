import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async registerUser(user: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }
    const hashed = await bcrypt.hash(user.password, 10);
    const createdUser = await this.prisma.user.create({ data: { email: user.email, password: hashed } });
    return { message: 'user created', userId: createdUser.id };
  }

  async login(user: LoginDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!existingEmail) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(user.password, existingEmail.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: existingEmail.id, email: existingEmail.email, role: existingEmail.role };
    const accessToken = this.jwtService.sign(payload)
    return {accessToken}
  }
}
