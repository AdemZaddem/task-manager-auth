import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.type';

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
    const payload: JwtPayload = { sub: existingEmail.id, email: existingEmail.email, role: existingEmail.role };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: existingEmail.id }, data: { hashedRefreshToken } });
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatch) throw new UnauthorizedException('Access denied');

    const payload: JwtPayload = { sub: userId, email: user.email, role: user.role };
    const newAccessToken = this.jwtService.sign(payload);

    return { accessToken: newAccessToken };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });

    return { message: 'User loged out' };
  }
}
