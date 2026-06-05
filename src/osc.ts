import { TCPHelper } from '@companion-module/base'

export type OscArgType = 'i' | 'f' | 's'

export interface OscArg {
	type: OscArgType
	value: number | string
}

const SLIP_END = 0xc0
const SLIP_ESC = 0xdb
const SLIP_ESC_END = 0xdc
const SLIP_ESC_ESC = 0xdd

function padTo4(len: number): number {
	return (len + 3) & ~3
}

function writeOscString(str: string): Buffer {
	const strBuf = Buffer.from(str + '\0', 'utf8')
	const padded = Buffer.alloc(padTo4(strBuf.length))
	strBuf.copy(padded)
	return padded
}

export function buildOscMessage(address: string, args: OscArg[]): Buffer {
	const addressBuf = writeOscString(address)

	let typeTag = ','
	for (const arg of args) {
		typeTag += arg.type
	}
	const typeTagBuf = writeOscString(typeTag)

	const argBuffers: Buffer[] = []
	for (const arg of args) {
		switch (arg.type) {
			case 'i': {
				const buf = Buffer.alloc(4)
				buf.writeInt32BE(arg.value as number, 0)
				argBuffers.push(buf)
				break
			}
			case 'f': {
				const buf = Buffer.alloc(4)
				buf.writeFloatBE(arg.value as number, 0)
				argBuffers.push(buf)
				break
			}
			case 's': {
				argBuffers.push(writeOscString(arg.value as string))
				break
			}
		}
	}

	return Buffer.concat([addressBuf, typeTagBuf, ...argBuffers])
}

function slipEncode(data: Buffer): Buffer {
	const encoded: number[] = [SLIP_END]
	for (const byte of data) {
		if (byte === SLIP_END) {
			encoded.push(SLIP_ESC, SLIP_ESC_END)
		} else if (byte === SLIP_ESC) {
			encoded.push(SLIP_ESC, SLIP_ESC_ESC)
		} else {
			encoded.push(byte)
		}
	}
	encoded.push(SLIP_END)
	return Buffer.from(encoded)
}

export async function sendOsc(tcp: TCPHelper, address: string, args: OscArg[]): Promise<boolean> {
	const msg = buildOscMessage(address, args)
	const frame = slipEncode(msg)
	return tcp.send(frame)
}
