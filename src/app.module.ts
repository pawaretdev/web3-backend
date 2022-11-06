import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose'
import { UsersController } from '@controllers/users/users.controller'
import { UserService } from '@modules/user/user.service'
import { User, UserSchema } from '@schemas/user.schema'
import { Schema } from 'mongoose'
import * as AutoIncrementFactory from 'mongoose-sequence'
import { snakeCase } from 'lodash'
import { AnyClass } from '@casl/ability/dist/types/types'

import './environments'
import { HelperService } from '@modules/helper/helper.service'

interface IModelSchema {
  model: AnyClass
  schema: Schema
}

const modelSchemas: IModelSchema[] = [
  {
    model: User,
    schema: UserSchema,
  },
]

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB),
    MongooseModule.forFeatureAsync(
      modelSchemas.map((each) => ({
        name: each.model.name,
        useFactory: (connection) => {
          const schema = each.schema
          const AutoIncrement = AutoIncrementFactory(connection)
          schema.plugin(AutoIncrement as any, {
            id: `${snakeCase(each.model.name)}_counter`,
            inc_field: 'id',
          })
          return schema
        },
        inject: [getConnectionToken()],
      })),
    ),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UserService, HelperService],
})
export class AppModule {}
