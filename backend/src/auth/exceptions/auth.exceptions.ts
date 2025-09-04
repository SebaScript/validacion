import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthException extends HttpException {
  constructor(message: string, status: HttpStatus, public readonly code?: string) {
    super(message, status);
  }
}

export class InvalidCredentialsException extends AuthException {
  constructor(message = 'Invalid credentials') {
    super(message, HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS');
  }
}

export class UserNotFoundException extends AuthException {
  constructor(message = 'User not found') {
    super(message, HttpStatus.NOT_FOUND, 'USER_NOT_FOUND');
  }
}

export class EmailAlreadyExistsException extends AuthException {
  constructor(message = 'Email already registered') {
    super(message, HttpStatus.CONFLICT, 'EMAIL_ALREADY_EXISTS');
  }
}

export class PasswordValidationException extends AuthException {
  constructor(message = 'Password validation failed') {
    super(message, HttpStatus.BAD_REQUEST, 'PASSWORD_VALIDATION_FAILED');
  }
}

export class OAuthUserCreationException extends AuthException {
  constructor(message = 'Failed to create OAuth user') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'OAUTH_USER_CREATION_FAILED');
  }
}

