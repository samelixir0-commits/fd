import { get, put } from '@vercel/blob'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const blobPath = 'fdvault/deposits.json'
const seedFile = fileURLToPath(new URL('../server/data/deposits.json', import.meta.url))
const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN?.trim().replace(/^['"]|['"]$/g, '')

const readSeed = async () => JSON.parse(await readFile(seedFile, 'utf8'))
const readDeposits = async () => {
  try {
    const result = await get(blobPath, { access: 'private', token: blobToken() })
    if (!result) return readSeed()
    const response = await fetch(result.downloadUrl)
    if (!response.ok) throw new Error('Could not download deposit data')
    return JSON.parse(await response.text())
  } catch {
    return readSeed()
  }
}
const saveDeposits = async (deposits) => { if (!blobToken()) { const error = new Error('BLOB_READ_WRITE_TOKEN is not configured'); error.code = 'BLOB_TOKEN_MISSING'; throw error }; return put(blobPath, JSON.stringify(deposits, null, 2), { access: 'private', token: blobToken(), addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' }) }
const send = (response, status, body) => { response.status(status).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Headers', 'Content-Type').setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); return response.status(status).json(body) }

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return response.status(204).end()
  try {
    const deposits = await readDeposits()
    const pathParts = request.url.split('?')[0].split('/').filter(Boolean)
    const id = Number(pathParts.at(-1))
    if (request.method === 'GET') return send(response, 200, deposits)
    if (request.method === 'POST') { const deposit = { ...request.body, id: Date.now() }; deposits.push(deposit); await saveDeposits(deposits); return send(response, 201, deposit) }
    if (request.method === 'PUT') { const index = deposits.findIndex((deposit) => deposit.id === id); if (index < 0) return send(response, 404, { error: 'Deposit not found' }); deposits[index] = { ...request.body, id }; await saveDeposits(deposits); return send(response, 200, deposits[index]) }
    if (request.method === 'DELETE') { const remaining = deposits.filter((deposit) => deposit.id !== id); if (remaining.length === deposits.length) return send(response, 404, { error: 'Deposit not found' }); await saveDeposits(remaining); return response.status(204).end() }
    return send(response, 405, { error: 'Method not allowed' })
  } catch (error) { console.error(error); if (error.code === 'BLOB_TOKEN_MISSING') return send(response, 503, { error: 'BLOB_READ_WRITE_TOKEN is missing in Vercel Production environment.' }); return send(response, 500, { error: `Could not access persistent deposit storage (${error.code || error.name || 'unknown'})` }) }
}
