import { HelperService } from '@modules/helper/helper.service'
import { UserService } from '@modules/user/user.service'
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@schemas/user.schema'
import {
  RequestToken,
  SimpleUserDto,
  UpdateProfileUserDto,
} from 'src/dto/user.dto'

@Controller('users')
export class UsersController {
  constructor(
    private userService: UserService,
    private helperService: HelperService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll() {
    const users = this.userService.findAll()
    return users
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('updateProfile')
  async updateProfile(
    @Req() req: any,
    @Body() payload: UpdateProfileUserDto,
  ): Promise<User> {
    console.log(req.user)
    const updatUser = await this.userService.updateOneById(req.user.id, payload)
    return updatUser
  }

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
  async verifySignature(@Body() payload: RequestToken): Promise<any> {
    const user = await this.userService.findOne({ address: payload.address })
    if (!this.helperService.validateSignature(user.nonce, payload))
      throw new UnauthorizedException()
    const accessToken = this.jwtService.sign({
      address: payload.address,
      nonce: user.nonce,
    })
    return {
      accessToken: accessToken,
    }
  }
}
