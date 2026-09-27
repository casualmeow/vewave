import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const width = 256
const height = 256
const outputPath = join(process.cwd(), 'public', 'spike', 'field.png')

function crc32(buffer) {
  let crc = 0xffffffff
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index]
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(typeAndData), 0)
  return Buffer.concat([length, typeAndData, checksum])
}

const raw = Buffer.alloc((width * 3 + 1) * height)
let cursor = 0
for (let y = 0; y < height; y += 1) {
  raw[cursor] = 0
  cursor += 1
  for (let x = 0; x < width; x += 1) {
    const stripe = Math.floor(x / 16) % 2 === 0
    const band = y < height / 2
    const grid = x % 32 === 0 || y % 32 === 0
    let value = stripe === band ? 236 : 18
    if (grid) value = value > 128 ? 96 : 214
    raw[cursor] = value
    raw[cursor + 1] = value
    raw[cursor + 2] = grid ? 200 : value
    cursor += 3
  }
}

const header = Buffer.alloc(13)
header.writeUInt32BE(width, 0)
header.writeUInt32BE(height, 4)
header[8] = 8
header[9] = 2
header[10] = 0
header[11] = 0
header[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', header),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, png)
console.log(`wrote ${outputPath} (${png.length} bytes, ${width}x${height})`)
