# Ruthless

## Architecture

Ruthless uses a three-tier architecture with clear separation of concerns:

- **`game/`** - Shared game logic (ECS, systems, actions, packets)
  - Framework-agnostic code that runs on both client and server
  - Pure game mechanics using Structure-of-Arrays for cache-friendly performance
  
- **`client/`** - Client-specific code (rendering, input, prediction)
  - PixiJS rendering with client-side prediction
  - React UI with Tailwind CSS
  
- **`server/`** - Server-authoritative code (validation, state management)
  - Authoritative game state with Matter.js physics
  - WebSocket-based binary protocol for efficient networking

### Key Features

- **Custom ECS** - Performance-oriented with typed arrays and explicit dependencies
- **Client-Side Prediction** - Responsive gameplay with server reconciliation
- **Binary Protocol** - Efficient Structure-of-Arrays serialization
- **Hot Reload** - Fast development with Bun's built-in watch mode

## Tech Stack

- **Runtime**: Bun (replaces Node.js, npm, webpack)
- **Graphics**: PixiJS (WebGL rendering)
- **Physics**: Matter.js (2D physics simulation)
- **UI**: React 19 + Tailwind CSS 4 (HUD/Menus/wiki/etc)
- **Language**: TypeScript (strict mode)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+

### Installation

```bash
bun install
```

### Development

```bash
# Start dev server with hot reload
bun dev

# Open game client
open http://localhost:3000
```

### Production

```bash
# Build client assets
bun run build

# Start production server
bun start
```

### Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test game/utility/input.test.ts
```

## Code Conventions

Ruthless follows strict conventions for consistency and performance:

### Naming

- **snake_case** for functions, variables, properties
- **SCREAMING_SNAKE_CASE** for constants
- **lowercase:colon** for system IDs and events (e.g., `'client:controller'`, `'game:entity:spawned'`)
- Keep external library conventions (React, PixiJS, Matter.js, Bun)

### Performance First

- Direct mutation over object spreading
- Buffer reuse to minimize GC pressure
- Cache-friendly data access with ECS queries
- Typed arrays for numeric data

### Type Safety

- Module augmentation for extending core types
- Type-first development (define interfaces before implementation)
- Explicit return types for public APIs

## Project Structure

```
ruthless/
├── game/              # Shared game logic
│   ├── action/        # Player actions (move, attack, etc.)
│   ├── component/     # ECS components (position, velocity, etc.)
│   ├── packet/        # Network serialization definitions
│   ├── system/        # Game systems (physics, collision, etc.)
│   └── utility/       # Helper functions
├── client/            # Client-specific code
│   ├── canvas/        # React UI components
│   ├── graphic/       # PixiJS rendering
│   └── system/        # Client systems (input, prediction, etc.)
└── server/            # Server-specific code
    └── system/        # Server systems (validation, sync, etc.)
```

## Documentation

Comprehensive documentation is available in `.cursor/rules/`:

- [**architecture.mdc**](.cursor/rules/architecture.mdc) - ECS patterns, system design, and separation of concerns
- [**typescript-patterns.mdc**](.cursor/rules/typescript-patterns.mdc) - Module augmentation and type-first development
- [**naming-conventions.mdc**](.cursor/rules/naming-conventions.mdc) - Naming rules with examples
- [**network-multiplayer.mdc**](.cursor/rules/network-multiplayer.mdc) - Packet serialization and client prediction
- [**performance.mdc**](.cursor/rules/performance.mdc) - Optimization patterns and best practices
- [**code-organization.mdc**](.cursor/rules/code-organization.mdc) - File structure and export patterns
- [**tooling.mdc**](.cursor/rules/tooling.mdc) - Bun runtime and development workflows

## System Example

```typescript
import { type System } from '@/game'

declare module '@/game' {
  interface Game {
    example: { count: number }
  }
}

export const system: System = {
  id: 'game:example',
  dependencies: [],
  install: async (game) => {
    game.example = { count: 0 }
  },
  tick: async (game, delta) => {
    const entities = game.query([game.components.position])
    game.example.count = entities.length
  }
}

export default system
```

## Component Example

```typescript
declare module '@/game' { 
  interface Components { 
    position: typeof component 
  }
}

export const component = {
  x: new Float32Array([]),
  y: new Float32Array([])
}
```

## Action Example

```typescript
import type { Action } from '@/game/system/action'

declare module '@/game/system/action' { 
  interface Actions { 
    move: MoveAction 
  } 
}

export type MoveAction = { x: number, y: number }

export const action: Action<'move'> = {
  id: 'move',
  execute: (game, entity, params) => {
    const velocity = game.get(entity, 'velocity')

    if (!velocity) return
    
    game.set(entity, 'velocity', { 
      x: params.x, 
      y: params.y 
    })
  }
}

export default action
```

## Performance Targets

At 60 FPS, each frame has a 16.67ms budget:

- System tick: < 1ms per system
- Physics update: < 3ms
- Rendering: < 8ms
- Network sync: < 1ms

## Contributing

Follow the conventions outlined in the documentation. Key principles:

1. **Keep `game/` pure** - No DOM, no PixiJS, no server-specific code
2. **Systems own their state** - Use module augmentation to extend `Game`
3. **Explicit dependencies** - Always declare what you depend on
4. **Events for communication** - Don't directly call other systems
5. **Performance first** - Mutate in place, reuse buffers, batch operations
