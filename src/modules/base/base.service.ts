import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BaseDocument } from 'src/schemas/base.schema'
import { RequireAtLeastOne } from 'src/types'

@Injectable()
export class BaseService<T = BaseDocument> {
  constructor(@InjectModel('model') private model: Model<T & BaseDocument>) {}

  async create(
    data: RequireAtLeastOne<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<T> {
    return await new this.model(data).save()
  }

  public async findOne(data: RequireAtLeastOne<T>): Promise<T> {
    return this.model.findOne(data as T).then((result: T) => {
      if (!result) throw new NotFoundException()
      return result
    })
  }

  async findOneById(id: BaseDocument['id']): Promise<T> {
    return await this.model.findOne({ id }).then((result: T) => {
      if (!result) throw new NotFoundException()
      return result
    })
  }

  async findOneOrCreate(
    data: RequireAtLeastOne<T>,
    payload?: RequireAtLeastOne<T>,
  ): Promise<T> {
    const result = await this.model.findOne(data as T)
    return result
      ? Promise.resolve(result)
      : new this.model({ ...payload, ...data }).save()
  }

  async updateOneById(id: BaseDocument['id'], data: Partial<T>): Promise<T> {
    return await this.model
      .findOneAndUpdate({ id }, data as T, { new: true })
      .then((result: T) => {
        if (!result) throw new NotFoundException()
        return result
      })
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec()
  }

  async delete(id: BaseDocument['id']): Promise<void> {
    return await this.model.findOneAndDelete({ id })
  }
}
