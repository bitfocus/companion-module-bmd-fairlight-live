const SLIP_END = 0xc0
const SLIP_ESC = 0xdb
const SLIP_ESC_END = 0xdc
const SLIP_ESC_ESC = 0xdd

export interface ParsedOscMessage {
	address: string
	args: OscValue[]
}

export type OscValue =
	| { type: 'i'; value: number }
	| { type: 'f'; value: number }
	| { type: 's'; value: string }
	| { type: 'b'; value: Buffer }

export class OscReceiver {
	private rxBuffer: Buffer = Buffer.alloc(0)
	private onMessage: (msg: ParsedOscMessage) => void

	constructor(onMessage: (msg: ParsedOscMessage) => void) {
		this.onMessage = onMessage
	}

	reset(): void {
		this.rxBuffer = Buffer.alloc(0)
	}

	feed(data: Buffer): void {
		this.rxBuffer = Buffer.concat([this.rxBuffer, data])
		this.processSlip()
	}

	private processSlip(): void {
		while (this.rxBuffer.length > 0) {
			// Skip leading END bytes
			while (this.rxBuffer.length > 0 && this.rxBuffer[0] === SLIP_END) {
				this.rxBuffer = this.rxBuffer.subarray(1)
			}

			if (this.rxBuffer.length === 0) return

			// Find next END byte
			let endPos = -1
			for (let i = 0; i < this.rxBuffer.length; i++) {
				if (this.rxBuffer[i] === SLIP_END) {
					endPos = i
					break
				}
			}

			if (endPos < 0) return // Incomplete frame

			// Decode SLIP escapes
			const raw = this.rxBuffer.subarray(0, endPos)
			this.rxBuffer = this.rxBuffer.subarray(endPos + 1)

			const decoded: number[] = []
			for (let i = 0; i < raw.length; i++) {
				if (raw[i] === SLIP_ESC && i + 1 < raw.length) {
					if (raw[i + 1] === SLIP_ESC_END) {
						decoded.push(SLIP_END)
						i++
					} else if (raw[i + 1] === SLIP_ESC_ESC) {
						decoded.push(SLIP_ESC)
						i++
					} else {
						decoded.push(raw[i])
					}
				} else {
					decoded.push(raw[i])
				}
			}

			if (decoded.length > 0) {
				const msg = parseOscMessage(Buffer.from(decoded))
				if (msg) {
					this.onMessage(msg)
				}
			}
		}
	}
}

function parseOscMessage(buf: Buffer): ParsedOscMessage | null {
	if (buf.length < 4) return null

	// Read address
	let pos = 0
	const addrEnd = buf.indexOf(0, pos)
	if (addrEnd < 0) return null
	const address = buf.toString('utf8', pos, addrEnd)
	pos = (addrEnd + 4) & ~3

	if (pos >= buf.length) return { address, args: [] }

	// Read type tag
	if (buf[pos] !== 0x2c) return { address, args: [] } // ','
	const typeTagStart = pos + 1
	const typeTagEnd = buf.indexOf(0, typeTagStart)
	if (typeTagEnd < 0) return { address, args: [] }
	const typeTags = buf.toString('utf8', typeTagStart, typeTagEnd)
	pos = (typeTagEnd + 4) & ~3

	// Read arguments
	const args: OscValue[] = []
	for (const tag of typeTags) {
		switch (tag) {
			case 'i':
				if (pos + 4 > buf.length) return { address, args }
				args.push({ type: 'i', value: buf.readInt32BE(pos) })
				pos += 4
				break
			case 'f':
				if (pos + 4 > buf.length) return { address, args }
				args.push({ type: 'f', value: buf.readFloatBE(pos) })
				pos += 4
				break
			case 's': {
				const strEnd = buf.indexOf(0, pos)
				if (strEnd < 0) return { address, args }
				args.push({ type: 's', value: buf.toString('utf8', pos, strEnd) })
				pos = (strEnd + 4) & ~3
				break
			}
			case 'b': {
				if (pos + 4 > buf.length) return { address, args }
				const length = buf.readInt32BE(pos)
				pos += 4
				if (length < 0 || pos + length > buf.length) return { address, args }
				args.push({ type: 'b', value: Buffer.from(buf.subarray(pos, pos + length)) })
				pos += (length + 3) & ~3
				break
			}
			default:
				break
		}
	}

	return { address, args }
}
