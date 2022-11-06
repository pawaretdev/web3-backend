import { HelperService } from '@modules/helper/helper.service'
import { UserService } from '@modules/user/user.service'
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { RequestToken, SimpleUserDto } from 'src/dto/user.dto'

@Controller('users')
export class UsersController {
  constructor(
    private userService: UserService,
    private helperService: HelperService,
  ) {}

  @Get('nonce/:address')
  async randomNonce(@Param('address') address: string) {
    const nonce = Math.floor(Math.random() * 1000000)
    const user = await this.userService.findOneOrCreate(
      { address: address },
      { address: address },
    )
    await this.userService.updateOneById(user.id, { nonce: nonce })
    return {
      nonce: nonce,
    }
  }

  @Post('verifySignature')
  async verifySignature(@Body() data: RequestToken): Promise<SimpleUserDto> {
    const user = await this.userService.findOne({ address: data.address })
    if (!this.helperService.validateSignature(user.nonce, data))
      throw new UnauthorizedException()
    return
  }
}
