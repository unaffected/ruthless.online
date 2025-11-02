/**
 * Collision layer configuration for Matter.js
 * 
 * Matter.js uses bitwise collision filtering:
 * - category: What collision category this body belongs to
 * - mask: Which categories this body can collide with
 * 
 * A collision occurs when:
 * (bodyA.category & bodyB.mask) !== 0 && (bodyB.category & bodyA.mask) !== 0
 */

export const LAYER = {
  WALL: 0x0001,   // 0b0001 - Static map boundaries
  PLAYER: 0x0002, // 0b0010 - Player entities
} as const

/**
 * Collision masks define which layers can collide with each other
 */
export const MASK = {
  WALL: LAYER.PLAYER, // Walls only collide with players
  PLAYER: LAYER.WALL, // Players only collide with walls (not other players)
} as const

/**
 * Pre-configured collision filters for common entity types
 */
export const COLLISION_FILTER = {
  WALL: {
    category: LAYER.WALL,
    mask: MASK.WALL,
  },
  PLAYER: {
    category: LAYER.PLAYER,
    mask: MASK.PLAYER,
  },
} as const

const collision = { LAYER, MASK, COLLISION_FILTER } as const

export default collision

