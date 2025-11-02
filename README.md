# ruthless.online

A 2D web-based multiplayer game engine.

**Core Engine** (`./game/index.ts`)
- Custom ECS implementation using structures of typed arrays for performance
- Plugin system for extending functionality

**Client/Server Architecture**
- `./client/index.ts` - Browser-based game client with webgl rendering (PixiJS)
- `./server/index.ts` - Authoritative game server with physics simulation (MatterJS)
- WebSocket networking with client-side prediction and server reconciliation

**Tech Stack**
- Runtime: Bun
- Graphics: PixiJS
- Physics: Matter.js
- UI: React + Tailwind
- Language: TypeScript

## Code Structure

The engine core (`./game/`) is framework-agnostic and used by both client and server. Client and server each install their own systems (rendering, networking, physics, etc.) as plugins. Components are just typed arrays, systems are just functions that iterate over entities.

## Getting Started

### Dependencies

- [Bun](https://bun.com/)

### Project Setup

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To open the game client:

```bash
open http://localhost:8080
```
