# [`ruthless.online`](https://ruthless.online)

I'd recommend looking at `./game/index.ts` first. This is the core of the engine. It exposes the following core functionality:

- ECS Engine: Provided by [bitECS](). Uses bitpacked SoAs and provides a binary codec.
  - `spawn`, `despawn`, `add`, `get`, etc.
- Event System: Internal event bus used to communicate between systems
  - `emit`, `on`, `off`, `once`
- Plugin System: Used to install additional systems.
  - `install`, `make`

Then, look at `./client/index.ts` and `./server/index.ts`. These are instances of the game engine in application. These files are really simple as they're really just importing the default game/systems, installing additional systems, and then starting the game engine.

From there, it's mostly just individual systems, utilities, etc. 

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