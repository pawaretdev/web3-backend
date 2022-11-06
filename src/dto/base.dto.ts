import { Expose } from "class-transformer"
import { IsDate, IsInt } from "class-validator"

export class BaseDto {
  constructor(data?: BaseDto) {
    Object.assign(this, data)
  }

  @Expose()
  @IsInt()
  id?: number

  @Expose()
  @IsDate()
  updatedAt?: Date

  @Expose()
  @IsDate()
  createdAt?: Date
}
