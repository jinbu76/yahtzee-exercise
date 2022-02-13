import { Injectable } from '@angular/core';
import { IDice } from '../models/dice.interface';

@Injectable({ providedIn: 'root' })
export class GameService {
  private dices: IDice[] = [];

  public isDiceSelected(index: number): boolean {
    return this.dices[index].isSelected;
  }

  public getDiceValue(index: number): number {
    return this.dices[index].value;
  }

  public setDiceValue(index: number, value: number) {
    this.dices[index].value = value;
  }

  public setAllDicesIsSelected(value: boolean) {
    this.dices.forEach((dice) => (dice.isSelected = value));
  }

  public getDices(): IDice[] {
    return this.dices;
  }

  public checkValidSelectedDice(index: number) {
    return this.dices[index] && this.dices[index].isSelected;
  }

  public initializeByIndex(index: number) {
    this.dices[index] = { value: -1, isSelected: false };
  }

  //TODO: create library Service
  public clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // TODO: create calculation service
  public calculateAllEyes(): number {
    return this.dices.reduce((sum, current) => sum + current.value, 0);
  }

  public checkFullHouse(): boolean {
    if (this.countSingleQuantity() === 2) return true;

    return false;
  }

  public checkYahtzee(): boolean {
    if (this.countSingleQuantity() === 1) return true;
    return false;
  }

  public sumEqualsEyes(value: number): number {
    return this.dices
      .filter((dice) => dice.value === value)
      .map((dice) => dice.value)
      .reduce((sum, current) => sum + current, 0);
  }

  public checkCountEqualsEyes(count: number): boolean {
    for (let num = 1; num <= 6; num++) {
      if (this.dices.filter((dice) => dice.value === num).length >= count)
        return true;
    }
    return false;
  }

  private countSingleQuantity(): number {
    const count: { [key: number]: number } = {};
    for (const dice of this.dices) {
      if (count[dice.value]) {
        count[dice.value] += 1;
      } else {
        count[dice.value] = 1;
      }
    }

    return Object.keys(count).length;
  }
}
