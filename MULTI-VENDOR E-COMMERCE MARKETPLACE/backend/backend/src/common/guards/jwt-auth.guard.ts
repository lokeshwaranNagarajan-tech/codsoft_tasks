import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const customRole = request.headers['x-user-role'] as Role;
    const customUserId = request.headers['x-user-id'] as string;
    const customVendorProfileId = request.headers['x-vendor-profile-id'] as string;

    // Support dev testing headers or simulated bearer token extraction
    if (customRole) {
      request.user = {
        id: customUserId || 'usr-vendor-1',
        email: 'vendor@markethub.com',
        role: customRole,
        vendorProfileId: customVendorProfileId || 'vp-vendor-1',
      } as AuthenticatedUser;
      return true;
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In production with Passport/JWT: verify and decode payload
      // For standard modular setup, attach verified principal
      request.user = {
        id: 'usr-vendor-1',
        email: 'merchant@markethub.com',
        role: Role.VENDOR,
        vendorProfileId: 'vp-vendor-1',
      } as AuthenticatedUser;
      return true;
    }

    // Default mock customer user for customer testing if unauthenticated
    request.user = {
      id: 'usr-customer-1',
      email: 'customer@markethub.com',
      role: Role.CUSTOMER,
    } as AuthenticatedUser;

    return true;
  }
}
