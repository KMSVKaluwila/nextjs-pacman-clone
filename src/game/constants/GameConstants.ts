export enum GameState {
  READY,
  PLAYING,
  PAUSED,
  LEVEL_COMPLETE,
  GAME_OVER,
}

export enum Direction {
  UP = 270,
  DOWN = 90,
  LEFT = 180,
  RIGHT = 0,
}

export enum GhostType {
  BLINKY = 'Blinky', // Red
  PINKY = 'Pinky',   // Pink
  INKY = 'Inky',     // Cyan
  CLYDE = 'Clyde',   // Orange
}

export const CELL_SIZE = 20;
export const POWER_MODE_DURATION = 8000; // 8 seconds

export const POINTS = {
  DOT: 10,
  POWER_PELLET: 50,
  GHOST: 200,
};

export const GHOST_COLORS = {
  [GhostType.BLINKY]: '#FF0000', // Red
  [GhostType.PINKY]: '#FFB8FF', // Pink
  [GhostType.INKY]: '#00FFFF',  // Cyan
  [GhostType.CLYDE]: '#FFB852', // Orange
};

export const MAZE_LAYOUT = [
  "####################",
  "#P...........#.....#",
  "#.####.#####.#.###.#",
  "#o####.#####.#.###o#",
  "#.####.#####.#.###.#",
  "#..................#",
  "#.####.#.######.##.#",
  "#.####.#.######.##.#",
  "#......#...BIKC#...#",
  "######.### # ###.###",
  "     #.#   #   #.#  ",
  "     #.# ##### #.#  ",
  "######.### ###.#####",
  "#............#.....#",
  "#.####.#####.#.###.#",
  "#o..##.......##..o.#",
  "###.##.#####.##.####",
  "###.##.#####.##.####",
  "#......#.....#.....#",
  "####################"
];

export const LEVEL_SETTINGS = [
  { level: 1, ghostSpeed: 1.5 },
  { level: 2, ghostSpeed: 1.7 },
  { level: 3, ghostSpeed: 1.9 },
  { level: 4, ghostSpeed: 2.1 },
  { level: 5, ghostSpeed: 2.3 },
];