import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, Web3 Backend developed by PAWARET.DEV 🚀!'
  }
}
