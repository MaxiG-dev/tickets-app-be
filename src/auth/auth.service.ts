import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponse } from './types/auth-response.type';
import { HandleException } from '../common/errors/handle.exceptions';
import { ValidRoles } from './enums/valid-roles.enum';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly handleException: HandleException,
  ) {}

  private getJwtToken({ email, username, rol }: User): string {
    return this.jwtService.sign({
      email,
      username,
      rol,
    });
  }

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.userService.create(signupInput);
    const token = this.getJwtToken(user);
    return { token, user };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.userService.findOne(null, loginInput.email);
    if (user.isBlocked) {
      throw new UnauthorizedException(
        'User is blocked, please contact support',
      );
    }
    if (!bcrypt.compareSync(loginInput.password, user.password)) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = this.getJwtToken(user);
    return { token, user };
  }

  async validateUser(email: string): Promise<User> {
    const user = await this.userService.findOne(null, email);
    if (user.isBlocked) {
      throw new UnauthorizedException(
        'User is blocked, please contact support',
      );
    }
    delete user.password;
    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user);
    return { token, user };
  }

  validateUserHasAuthorization(email: string, user: User) {
    if (email && email !== user.email) {
      if (!user.rol.includes(ValidRoles.admin)) {
        this.handleException.newError({ code: 'Unauthorized' });
      }
    }
  }
}
