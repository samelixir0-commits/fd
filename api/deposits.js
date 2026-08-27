import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const dataFile = fileURLToPath(new URL('../server/data/deposits.json', import.meta.url))

const readDeposits = async () => JSON.parse(await readFile(dataFile, 'utf8'))
const saveDeposits = async (deposits) => writeFile(dataFile, `${JSON.stringify(deposits, null, 2)}\n`, 'utf8')
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
  } catch (error) { console.error(error); const message = error.code === 'EROFS' ? 'Vercel filesystem is read-only. Use a persistent Node host for JSON writes.' : 'Could not access deposit data'; return send(response, 500, { error: message }) }
}
