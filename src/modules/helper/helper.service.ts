import { recoverPersonalSignature } from '@metamask/eth-sig-util'
import { Injectable } from '@nestjs/common'
import { bufferToHex } from 'ethereumjs-util'
import { RequestToken } from 'src/dto/user.dto'

@Injectable()
export class HelperService {
  public validateSignature(nonce: number, data: RequestToken) {
    const message = `Nonce: ${nonce}`
    const messageHex = bufferToHex(Buffer.from(message, 'utf8'))
    const address = recoverPersonalSignature({
      data: messageHex,
      signature: data.signature,
    })
    return address.toLowerCase() === data.address.toLowerCase()
  }
}
