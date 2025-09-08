import { Logger } from '@nestjs/common';
import { 
  InvalidCredentialsException, 
  UserNotFoundException, 
  EmailAlreadyExistsException,
  OAuthUserCreationException,
  PasswordValidationException 
} from '../exceptions/auth.exceptions';

export class AuthErrorHandler {
  private static readonly logger = new Logger(AuthErrorHandler.name);

  static handleUserNotFound(error: any, context: string): never {
    this.logger.warn(`User not found in ${context}`, { error: error.message });
    throw new UserNotFoundException();
  }

  static handleInvalidCredentials(error: any, context: string): never {
    this.logger.warn(`Invalid credentials in ${context}`, { error: error.message });
    throw new InvalidCredentialsException();
  }

  static handleEmailAlreadyExists(error: any, context: string): never {
    this.logger.warn(`Email already exists in ${context}`, { error: error.message });
    throw new EmailAlreadyExistsException();
  }

  static handlePasswordValidation(error: any, context: string): never {
    this.logger.warn(`Password validation failed in ${context}`, { error: error.message });
    throw new PasswordValidationException();
  }

  static handleOAuthUserCreation(error: any, context: string): never {
    this.logger.error(`OAuth user creation failed in ${context}`, { 
      error: error.message, 
      stack: error.stack 
    });
    throw new OAuthUserCreationException();
  }

  static handleDatabaseError(error: any, context: string): never {
    this.logger.error(`Database error in ${context}`, { 
      error: error.message, 
      code: error.code,
      stack: error.stack 
    });

    // Handle specific database error codes
    switch (error.code) {
      case '23505': // Unique constraint violation (PostgreSQL)
        throw new EmailAlreadyExistsException();
      case '23502': // Not null constraint violation
        this.logger.error('Required field missing', { error });
        throw new PasswordValidationException('Required field is missing');
      default:
        throw error;
    }
  }

  static handleGenericError(error: any, context: string, fallbackMessage?: string): never {
    this.logger.error(`Unexpected error in ${context}`, { 
      error: error.message, 
      stack: error.stack 
    });

    // If it's already a known exception, re-throw it
    if (error instanceof InvalidCredentialsException || 
        error instanceof UserNotFoundException ||
        error instanceof EmailAlreadyExistsException ||
        error instanceof PasswordValidationException ||
        error instanceof OAuthUserCreationException) {
      throw error;
    }

    // For unknown errors, throw a generic invalid credentials exception to avoid leaking information
    throw new InvalidCredentialsException(fallbackMessage || 'Authentication failed');
  }
}

