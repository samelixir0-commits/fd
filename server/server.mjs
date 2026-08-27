import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dataFile = resolve(root, 'server/data/deposits.json')
const port = Number(process.env.PORT || 5174)

const send = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' })
  response.end(status === 204 ? '' : JSON.stringify(body))
}
const readDeposits = () => new Promise((resolveData, reject) => readFile(dataFile, 'utf8', (error, content) => error ? reject(error) : resolveData(JSON.parse(content))))
const saveDeposits = (deposits) => new Promise((resolveData, reject) => writeFile(dataFile, `${JSON.stringify(deposits, null, 2)}\n`, 'utf8', (error) => error ? reject(error) : resolveData()))
const readBody = (request) => new Promise((resolveBody, reject) => { let body = ''; request.on('data', (chunk) => { body += chunk }); request.on('end', () => { try { resolveBody(JSON.parse(body || '{}')) } catch { reject(new Error('Invalid JSON')) } }) })

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {})
  if (!request.url?.startsWith('/api/deposits')) return send(response, 404, { error: 'Not found' })
  try {
    const deposits = await readDeposits()
    const id = Number(request.url.split('/').pop())
    if (request.method === 'GET') return send(response, 200, deposits)
    if (request.method === 'POST') { const deposit = { ...(await readBody(request)), id: Date.now() }; deposits.push(deposit); await saveDeposits(deposits); return send(response, 201, deposit) }
    if (request.method === 'PUT') { const updated = await readBody(request); const index = deposits.findIndex((deposit) => deposit.id === id); if (index < 0) return send(response, 404, { error: 'Deposit not found' }); deposits[index] = { ...updated, id }; await saveDeposits(deposits); return send(response, 200, deposits[index]) }
    if (request.method === 'DELETE') { const remaining = deposits.filter((deposit) => deposit.id !== id); if (remaining.length === deposits.length) return send(response, 404, { error: 'Deposit not found' }); await saveDeposits(remaining); return send(response, 204, {}) }
    return send(response, 405, { error: 'Method not allowed' })
  } catch (error) { console.error(error); return send(response, 500, { error: 'Could not access deposit file' }) }
})
server.on('error', (error) => { if (error.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. The FDvault API may already be running.`); else console.error(error); process.exitCode = 1 })
server.listen(port, '127.0.0.1', () => console.log(`FDvault API listening on http://127.0.0.1:${port}`))
