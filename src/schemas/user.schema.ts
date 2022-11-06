
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base, BaseDocument } from '@schemas/base.schema';

@Schema({ timestamps: true })
export class User extends Base {
  constructor(user?: User) {
    super();
    Object.assign(this, user);
  }

  static get ModelName() {
    return 'User';
  }

  @Prop({ default: null })
  username?: string;

  @Prop({ default: null })
  profile?: string;

  @Prop({ default: null })
  banner?: string;

  @Prop({ unique: true })
  address: string;

  @Prop({ default: 0 })
  nonce: number;
}

export type UserDocument = User & BaseDocument

export const UserSchema = SchemaFactory.createForClass(User)
