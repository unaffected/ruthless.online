export type Button = typeof INPUT[keyof typeof INPUT]
export type State = { -readonly [K in keyof typeof INPUT]: boolean }

export const INPUT = {
  UP: 0,      MENU: 12,     ACTION_1: 4,   ACTION_5: 8,
  DOWN: 1,    SUBMIT: 13,   ACTION_2: 5,   ACTION_6: 9,    
  LEFT: 2,    SELECT: 14,   ACTION_3: 6,   ACTION_7: 10,
  RIGHT: 3,   ESCAPE: 15,   ACTION_4: 7,   ACTION_8: 11,
} as const

export const pack = (state: Partial<State>): number => {
  let packed = 0

  for (const [key, bit] of Object.entries(INPUT)) {
    if (state[key as keyof typeof INPUT]) {
      packed |= (1 << bit)
    }
  }

  return packed
}

export const unpack = (packed: number): State => {
  const state = {} as State

  for (const [key, bit] of Object.entries(INPUT)) {
    state[key as keyof typeof INPUT] = Boolean(packed & (1 << bit))
  }

  return state
}

export const isPressed = (packed: number, button: Button): boolean => !!(packed & (1 << button))

export const setButton = (packed: number, button: Button, pressed: boolean): number => {
  return pressed ? packed | (1 << button) : packed & ~(1 << button) 
}

