import { OmitType, PickType } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { PropertyOf } from 'src/types'
import { BaseDto } from './base.dto'

@Expose()
export class UserDto extends BaseDto {
  constructor(user: PropertyOf<UserDto>) {
    super(user)
    Object.assign(this, user)
  }

  @Expose()
  @IsString()
  username: string

  @Expose()
  @IsString()
  profile: string

  @Expose()
  @IsString()
  banner: string

  @Expose()
  @IsString()
  address: string

  @Expose()
  @IsNumber()
  nonce: number
}

@Exclude()
export class SimpleUserDto extends OmitType(UserDto, [
  'createdAt',
  'updatedAt',
]) {
  constructor(user: PropertyOf<SimpleUserDto>) {
    super(user)
    Object.assign(this, user)
  }
}

@Exclude()
export class UpdateProfileUserDto extends PickType(UserDto, [
  'username',
  'profile',
  'banner',
]) {
  constructor(user: PropertyOf<SimpleUserDto>) {
    super(user)
    Object.assign(this, user)
  }
}

export class RequestToken {
  @IsString()
  @IsNotEmpty()
  signature!: string

  @IsString()
  @IsNotEmpty()
  address!: string
}
