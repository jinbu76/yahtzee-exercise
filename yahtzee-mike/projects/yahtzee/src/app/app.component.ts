import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Constants } from '../common/constants';
import {Evaluation, PlayerValues} from './models/evaluationinterface';
import { Dice } from './models/dice.interface';
import {count} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  // @ts-ignore
  @ViewChild('one') one: TemplateRef<any>;
  // @ts-ignore
  @ViewChild('zero') zero: TemplateRef<any>;
  // @ts-ignore
  @ViewChild('two') two: TemplateRef<any>;
  // @ts-ignore
  @ViewChild('three') three: TemplateRef<any>;
  // @ts-ignore
  @ViewChild('four') four: TemplateRef<any>;
  // @ts-ignore
  @ViewChild('five') five: TemplateRef<any>;
  // @ts-ignore
  @ViewChild('six') six: TemplateRef<any>;

  public evaluations: Evaluation[] = [];

  public dices: Dice[] = [];
  public diceSelected: boolean[] = [];
  // @ts-ignore
  public templates: Array<TemplateRef<any>> = [];

  public isLoaded: boolean = true;

  public summaryPlayersPoints: number[] = [];
  public activePlayer: number = 0;
  public countRoll: number = Constants.maxRolls;

  public stringToNumber: { [key: string]: number } = {
    ['Ones']: 1,
    ['Twos']: 2,
    ['Threes']: 3,
    ['Fours']: 4,
    ['Fives']: 5,
    ['Sixes']: 6,
  };

  public ofAKindToCount: { [key: string]: number } = {
    ['3 of a kind']: 3,
    ['4 of a kind']: 4,
  };

  ngAfterViewInit(): void {
    this.initialize();
    this.restart();
  }

  public onRoll(): void {
    for (let dice = 0; dice < Constants.maxDices; dice++) {
      if (this.dices[dice].isSelected) continue;

      const min = Math.ceil(1);
      const max = Math.floor(6);
      const random = Math.floor(Math.random() * (max - min + 1)) + min;

      this.dices[dice].value = random;

      switch (random) {
        case 1:
          this.templates[dice] = this.one;
          break;
        case 2:
          this.templates[dice] = this.two;
          break;
        case 3:
          this.templates[dice] = this.three;
          break;
        case 4:
          this.templates[dice] = this.four;
          break;
        case 5:
          this.templates[dice] = this.five;
          break;
        case 6:
          this.templates[dice] = this.six;
          break;
      }
    }

    this.countRoll--;
  }

  public disabledSelect(evaluation: Evaluation, activePlayer: number): boolean {
    return evaluation.players[activePlayer].isSelectedDisabled;
  }
  public switchPlayer(): void {
    this.countRoll = Constants.maxRolls;
    this.activePlayer++;
    if (this.activePlayer === Constants.maxPlayer) {
      this.activePlayer = 0;
    }
    this.dices.forEach((dice) => (dice.isSelected = false));

    this.evaluations.forEach(evaluation => {
      const player = evaluation.players[this.activePlayer];
      if (player.points == 0) {
        player.isSelectedDisabled = false;
      }
    })
    this.onRoll();
  }

  public selectDice(dice: Dice): void {
    dice.isSelected = !dice.isSelected;
  }

  public swipeAway(evaluation: Evaluation, activePlayer: number): void {

  }


  public restart() {
    const pvs: PlayerValues[] = [];
    for (let player = 0; player < Constants.maxPlayer; player++) {
      const pv: PlayerValues = { points: 0, isSelectedDisabled: false };
      pvs.push(pv);
    }
    this.evaluations = [
      { name: 'Ones', players: JSON.parse(JSON.stringify(pvs)), value: 1 },
      { name: 'Twos', players: JSON.parse(JSON.stringify(pvs)), value: 2 },
      { name: 'Threes', players: JSON.parse(JSON.stringify(pvs)), value: 3 },
      { name: 'Fours', players: JSON.parse(JSON.stringify(pvs)), value: 4 },
      { name: 'Fives', players: JSON.parse(JSON.stringify(pvs)), value: 5 },
      { name: 'Sixes', players: JSON.parse(JSON.stringify(pvs)), value: 6 },
      { name: '3 of a kind', players: JSON.parse(JSON.stringify(pvs)), value: -1 },
      { name: '4 of a kind', players: JSON.parse(JSON.stringify(pvs)), value: -1 },
      { name: 'Small Straight', players: JSON.parse(JSON.stringify(pvs)), value: 30 },
      { name: 'Large Straight', players: JSON.parse(JSON.stringify(pvs)), value: 40 },
      { name: 'Full House', players: JSON.parse(JSON.stringify(pvs)), value: 25 },
      { name: 'Yahtzee', players: JSON.parse(JSON.stringify(pvs)), value: 50 },
      { name: 'Chance', players: JSON.parse(JSON.stringify(pvs)), value: -1 },
    ];
  }

  public setClass(index: number) {
    const dice = this.dices[index];

    if (!dice || !dice.isSelected) return '';

    return 'selected';
  }

  public addPoints(evaluation: Evaluation, playerNumber: number): void {
    const evaluationName: string = evaluation.name;

    let point: number = 0;
    switch (evaluationName) {
      case 'Ones':
      case 'Twos':
      case 'Threes':
      case 'Fours':
      case 'Fives':
      case 'Sixes':
        point = this.sumValues(this.stringToNumber[evaluationName]);
        break;

      case '3 of a kind':
      case '4 of a kind':
        const check = this.checkOfAKind(this.ofAKindToCount[evaluationName]);
        if (check) {
          point = this.dices.reduce((sum, current) => sum + current.value, 0);
        }
        break;

      case 'Small Straight': if (this.checkStraight('SMALL')) { point = 30 } break;
      case 'Large Straight': if (this.checkStraight('LARGE')) { point = 40 } break;

      case 'Full House':
        if (this.checkFullHouse()) point = evaluation.value;
        break;

      case 'Yahtzee':
        if (this.checkYahtzee()) point = evaluation.value;
        break;

      case 'Chance':
        point = this.dices.reduce((sum, current) => sum + current.value, 0);
        break;
    }

    if (point === 0) return;

    evaluation.players[playerNumber].points = point;
    // evaluation.players[playerNumber].isSelectedDisabled = true;
    for (const ev of this.evaluations) {
      ev.players[this.activePlayer].isSelectedDisabled = true;
    }

    this.countRoll = 0;
    this.summaryPointsCalculator();

  }

  public checkFullHouse(): boolean {

    const count: { [key:number]:number } = {};
    for (const dice of this.dices) {

      if (count[dice.value]) {
        count[dice.value] += 1;
      } else {
        count[dice.value] = 1;
      }
    }

    if (Object.keys(count).length === 2) return true;

    return false;
  }

  public checkYahtzee(): boolean {

    const count: { [key:number]:number } = {};
    for (const dice of this.dices) {

      if (count[dice.value]) {
        count[dice.value] += 1;
      } else {
        count[dice.value] = 1;
      }
    }

    if (Object.keys(count).length === 1) return true;
    return false;
  }

  public initialize(): void {
    for (let countDices = 0; countDices < Constants.maxDices; countDices++) {
      this.templates[countDices] = this.zero;
      this.dices[countDices] = { value: -1, isSelected: false };
    }

    for (
      let countPlayers = 0;
      countPlayers < Constants.maxPlayer;
      countPlayers++
    ) {
      this.summaryPlayersPoints[countPlayers] = 0;
    }

    this.countRoll = Constants.maxRolls;

    setTimeout(() => {
      this.isLoaded = false;
    }, 1000);
  }

  private checkStraight(type: 'SMALL' | 'LARGE'): boolean {
    const clone = JSON.parse(JSON.stringify(this.dices));

    clone.sort((a: Dice, b: Dice) => {
      if (a.value > b.value) return 1;
      if (a.value < b.value) return -1;
      else return 0;
    });


    let countHit = 0;
    for (let index = 0; index < clone.length - 1; index++) {
      const actualValue = clone[index].value;
      const nextValue = clone[index + 1].value;
      if (actualValue + 1 === nextValue) {
        countHit++;
      }
    }

    if (type === 'SMALL' && countHit === Constants.maxDices - 2) return true;
    if (type === 'LARGE' && countHit === Constants.maxDices - 1) return true;

    return false;
  }

  private sumValues(value: number): number {
    let sum: number = 0;

    for (const dice of this.dices) {
      if (dice.value === value) sum += value;
    }
    return sum;
  }

  private checkOfAKind(count: number): boolean {
    let check: boolean = false;
    for (let num = 1; num <= 6; num++) {
      if (this.dices.filter((dice) => dice.value === num).length >= count) {
        check = true;
        break;
      }
    }

    return check;
  }

  private summaryPointsCalculator(): void {
    const summaryPoints: number[] = [0, 0];

    for (const evaluation of this.evaluations) {
      const playersPoints: number[] = evaluation.players.map(player => player.points);
      for (
        let countPlayer = 0;
        countPlayer < playersPoints.length;
        countPlayer++
      ) {
        summaryPoints[countPlayer] += playersPoints[countPlayer];
      }
    }
    this.summaryPlayersPoints = summaryPoints;
  }
}
