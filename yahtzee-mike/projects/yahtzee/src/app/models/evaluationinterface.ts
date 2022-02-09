/*export interface Evaluation {
  name: string;
  playersPoints: number[];
  value: number;
  isSelectedDisabled: boolean;
}*/

export interface Evaluation {
  name: string;
  players: PlayerValues[];
  value: number;
}

export interface PlayerValues {
  points: number;
  isSelectedDisabled: boolean;
}
