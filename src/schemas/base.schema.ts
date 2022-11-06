import { Prop, Schema } from '@nestjs/mongoose'
import { PickType } from '@nestjs/swagger'
import { Document, Types } from 'mongoose'

class ExtendedDocument extends Document<Types.ObjectId> {}

@Schema({ timestamps: true })
export class Base extends PickType(ExtendedDocument, ['_id']) {
  @Prop({ unique: true })
  id!: number

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date
}

export type BaseDocument = ExtendedDocument & Base
