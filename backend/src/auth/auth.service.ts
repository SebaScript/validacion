import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthErrorHandler } from './utils/error-handler.util';
import { 
  InvalidCredentialsException,
} from './exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      if (!email || !password) {
        this.logger.warn('validateUser called with missing email or password');
        return null;
      }

      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        this.logger.warn(`User not found for email: ${email}`);
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for email: ${email}`);
        return null;
      }

      const { password: _, ...result } = user;
      this.logger.log(`User validated successfully: ${email}`);
      return result;
    } catch (error) {
      this.logger.error('Error in validateUser', {
        email,
        error: error.message,
        stack: error.stack
      });
      return null;
    }
  }

  async validateOAuthUser(oauthUser: any): Promise<any> {
    try {
      if (!oauthUser?.email) {
        throw new Error('OAuth user email is required');
      }

      // Try to find existing user by email
      const existingUser = await this.userService.findByEmail(oauthUser.email);
      
      if (existingUser) {
        const { password, ...result } = existingUser;
        this.logger.log(`Existing OAuth user found: ${oauthUser.email}`);
        return result;
      }
    } catch (error) {
      // Log the attempt to find existing user
      this.logger.debug(`Existing user not found for OAuth email: ${oauthUser.email}`);
    }

    // User doesn't exist, create new user
    try {
      const newUserDto: CreateUserDto = {
        name: oauthUser.name || 'OAuth User',
        email: oauthUser.email,
        password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        role: 'client',
      };
      
      const newUser = await this.userService.create(newUserDto);
      const { password, ...result } = newUser;
      this.logger.log(`New OAuth user created: ${oauthUser.email}`);
      return result;
    } catch (error) {
      AuthErrorHandler.handleOAuthUserCreation(error, 'validateOAuthUser');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      if (!loginDto.email || !loginDto.password) {
        this.logger.warn('Login attempt with missing email or password');
        throw new InvalidCredentialsException('Email and password are required');
      }

      const user = await this.userService.findByEmail(loginDto.email);
      
      if (!user) {
        AuthErrorHandler.handleUserNotFound(new Error('User not found'), 'login');
      }
      
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      
      if (!isPasswordValid) {
        AuthErrorHandler.handleInvalidCredentials(new Error('Invalid password'), 'login');
      }

      const payload = { 
        email: user.email, 
        sub: user.userId, 
        role: user.role,
        name: user.name 
      };

      const { password, ...result } = user;
      
      this.logger.log(`User logged in successfully: ${loginDto.email}`);
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
    } catch (error) {
      AuthErrorHandler.handleGenericError(error, 'login');
    }
  }

  async oauthLogin(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.userId, 
      role: user.role,
      name: user.name 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      if (!createUserDto.email || !createUserDto.password) {
        this.logger.warn('Registration attempt with missing email or password');
        throw new InvalidCredentialsException('Email and password are required');
      }

      const user = await this.userService.create(createUserDto);
      
      const payload = { 
        email: user.email, 
        sub: user.userId, 
        role: user.role,
        name: user.name 
      };
      
      const { password, ...result } = user;
      
      this.logger.log(`User registered successfully: ${createUserDto.email}`);
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
    } catch (error) {
      AuthErrorHandler.handleDatabaseError(error, 'register');
    }
  }

  async getProfile(userId: number) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const user = await this.userService.findOne(userId);
      
      if (!user) {
        AuthErrorHandler.handleUserNotFound(new Error('User not found'), 'getProfile');
      }

      const { password, ...result } = user;
      this.logger.log(`Profile retrieved for user ID: ${userId}`);
      return result;
    } catch (error) {
      AuthErrorHandler.handleGenericError(error, 'getProfile', 'Failed to retrieve user profile');
    }
  }
} 