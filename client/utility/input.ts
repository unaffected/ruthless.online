import { INPUT } from '@/game/utility/input'

export type GamePad = { [K in keyof typeof INPUT]?: number[] }
export type Keyboard = { [K in keyof typeof INPUT]?: string[] }

export type Joystick = {
  horizontal?: number
  vertical?: number
  deadzone?: number
}

export type Mapping = {
  keyboard: Keyboard
  gamepad: {
    buttons: GamePad
    axes: Joystick
  }
}

export const CACHE_KEY = 'ruthless:input:mapping' as const

export const KEYBOARD: Keyboard = {
  UP: ['KeyW', 'ArrowUp'],
  DOWN: ['KeyS', 'ArrowDown'],
  LEFT: ['KeyA', 'ArrowLeft'],
  RIGHT: ['KeyD', 'ArrowRight'],
  MENU: ['KeyM'],
  SELECT: ['Tab', 'KeyR'],
  SUBMIT: ['Enter', 'Space'],
  ESCAPE: ['Escape'],
  ACTION_1: ['KeyF', 'KeyF'],
  ACTION_2: ['Space', 'KeyE'],
  ACTION_3: ['ShiftLeft', 'ShiftRight'],
  ACTION_4: ['Digit4', 'KeyQ'],
  ACTION_5: ['Digit5', 'KeyZ'],
  ACTION_6: ['Digit6', 'KeyX'],
  ACTION_7: ['Digit7', 'KeyC'],
  ACTION_8: ['Digit8', 'KeyV'],
}

export const GAMEPAD: Mapping['gamepad'] = {
  axes: {
    horizontal: 0,
    vertical: 1,
    deadzone: 0.2,
  },
  buttons: {
    UP: [12],       // D-pad up
    DOWN: [13],     // D-pad down
    LEFT: [14],     // D-pad left
    RIGHT: [15],    // D-pad right
    MENU: [9],      // Start
    SELECT: [8],    // Select/Back
    SUBMIT: [0],    // A button
    ESCAPE: [1],    // B button
    ACTION_1: [2],  // X button
    ACTION_2: [3],  // Y button
    ACTION_3: [4],  // Left bumper
    ACTION_4: [5],  // Right bumper
    ACTION_5: [6],  // Left trigger
    ACTION_6: [7],  // Right trigger
    ACTION_7: [10], // Left stick button
    ACTION_8: [11], // Right stick button
  },
}

export const save = (mapping: Mapping): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(mapping))
  } catch (error) {
    console.error('[input] Failed to save mapping:', error)
  }
}

export const load = (): Mapping => {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('[input] Failed to load mapping:', error)
  }
  
  return {
    keyboard: KEYBOARD,
    gamepad: GAMEPAD,
  }
}

