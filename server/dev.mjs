import { spawn } from 'node:child_process'

const api = spawn(process.execPath, ['server/server.mjs'], { stdio: 'inherit' })
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true })

const stop = () => {
  if (!api.killed) api.kill()
  if (!vite.killed) vite.kill()
}
api.on('exit', (code) => { if (code !== 0) vite.kill(); process.exitCode = code ?? 0 })
vite.on('exit', (code) => { if (code !== 0) api.kill(); process.exitCode = code ?? 0 })
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
