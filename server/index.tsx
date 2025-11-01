import game from '@/game'
import systems from '@/server/system'

await game.install(systems)

game.start()

console.debug('[server] started:', `http://localhost:${import.meta.env.PORT ?? 8080}`)