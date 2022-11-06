import { UserService } from '@modules/user/user.service'
import { Injectable, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(address: string, nonce: number): Promise<any> {
    const user = await this.userService.findOne({
      address: address,
      nonce: nonce,
    })
    if (!user) throw new UnauthorizedException()
    return user
  }
}
