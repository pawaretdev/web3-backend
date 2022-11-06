import { BaseService } from '@modules/base/base.service'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from '@schemas/user.schema'
import { Model } from 'mongoose'

@Injectable()
export class UserService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel)
  }
}
