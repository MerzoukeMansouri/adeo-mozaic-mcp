import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { timingSafeEqual } from "crypto";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly authToken: string;

  constructor(private configService: ConfigService) {
    this.authToken = this.configService.get<string>("auth.token", "");
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Skip auth in development mode if no token is configured
    if (process.env.NODE_ENV === "development" && !this.authToken) {
      this.logger.warn("Authentication skipped in development mode (no token configured)");
      return true;
    }

    // Check if authorization header is present
    if (!authHeader) {
      this.logger.warn(`Unauthorized access attempt from ${request.ip}`);
      throw new UnauthorizedException("Missing authorization header");
    }

    // "Bearer <token>": scheme is case-insensitive (RFC 7235), extra whitespace tolerated
    const token = authHeader.match(/^\s*Bearer\s+(\S+)\s*$/i)?.[1];
    if (!token) {
      this.logger.warn(`Invalid authorization format from ${request.ip}`);
      throw new UnauthorizedException("Invalid authorization format");
    }

    // Validate token
    const expected = Buffer.from(this.authToken);
    const received = Buffer.from(token);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      this.logger.warn(`Invalid token from ${request.ip}`);
      throw new UnauthorizedException("Invalid token");
    }

    return true;
  }
}
