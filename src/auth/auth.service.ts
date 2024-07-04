import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/UserSchema';
import { CreateUserDto } from './dto/CreateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; token: string }> {
    try {
      const existingUser = await this.userModel.findOne({
        username: createUserDto.username,
      });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      const hash = await bcrypt.hash(createUserDto.password, 10);
      const newUser = await this.userModel.create({
        username: createUserDto.username,
        password: hash,
        name: createUserDto.name,
      });

      const token = this.generateToken(newUser);
      return { message: 'User registered successfully', token };
    } catch (error) {
      console.error('Error in registerUser:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while registering the user',
      );
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const user = await this.userModel.findOne({
      username: loginUserDto.username,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const token = this.generateToken(user);
    return { token };
  }

  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      username: user.username,
    };
    return this.jwtService.sign(payload);
  }

  async getUsers(): Promise<User[]> {
    return this.userModel.find();
  }
}
