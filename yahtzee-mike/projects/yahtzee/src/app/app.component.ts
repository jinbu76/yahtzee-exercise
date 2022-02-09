import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Constants } from '../common/constants';
import { Evaluation } from './models/evaluation.interface';
import { IDice } from './models/dice.interface';
import { GameService } from './services/game.service';

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

  constructor(public gameService: GameService) {}

  ngAfterViewInit(): void {
    this.initialize();
    this.restart();
  }

  public onRoll(): void {
    for (let dice = 0; dice < Constants.maxDices; dice++) {
      if (this.gameService.isDiceSelected(dice)) continue;

      const min = Math.ceil(1);
      const max = Math.floor(6);
      const random = Math.floor(Math.random() * (max - min + 1)) + min;

      this.gameService.setDiceValue(dice, random);

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
    return evaluation.isSelectDisabled[activePlayer];
  }

  public switchPlayer(): void {
    this.countRoll = Constants.maxRolls;
    this.activePlayer++;
    if (this.activePlayer === Constants.maxPlayer) {
      this.activePlayer = 0;
    }
    this.gameService.setAllDicesIsSelected(false);

    this.evaluations.forEach((evaluation) => {
      if (evaluation.points[this.activePlayer] === 0) {
        evaluation.isSelectDisabled[this.activePlayer] = false;
      }
    });
    this.onRoll();
  }

  public selectDice(dice: IDice): void {
    dice.isSelected = !dice.isSelected;
  }

  public swipeAway(evaluation: Evaluation, activePlayer: number): void {}

  public restart() {
    const points: number[] = [];
    const isSelectDisabled: boolean[] = [];
    for (let player = 0; player < Constants.maxPlayer; player++) {
      points.push(0);
      isSelectDisabled.push(false);
    }

    this.evaluations = [
      {
        name: 'Ones',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 1,
      },
      {
        name: 'Twos',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 2,
      },
      {
        name: 'Threes',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 3,
      },
      {
        name: 'Fours',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 4,
      },
      {
        name: 'Fives',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 5,
      },
      {
        name: 'Sixes',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 6,
      },
      {
        name: '3 of a kind',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: -1,
      },
      {
        name: '4 of a kind',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: -1,
      },
      {
        name: 'Small Straight',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 30,
      },
      {
        name: 'Large Straight',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 40,
      },
      {
        name: 'Full House',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 25,
      },
      {
        name: 'Yahtzee',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: 50,
      },
      {
        name: 'Chance',
        points: JSON.parse(JSON.stringify(points)),
        isSelectDisabled: JSON.parse(JSON.stringify(isSelectDisabled)),
        value: -1,
      },
    ];
  }

  public setClass(index: number) {
    if (!this.gameService.checkValidSelectedDice(index)) return '';
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
        point = this.gameService.sumEqualsEyes(
          this.stringToNumber[evaluationName]
        );
        break;

      case '3 of a kind':
      case '4 of a kind':
        const check = this.gameService.checkCountEqualsEyes(
          this.ofAKindToCount[evaluationName]
        );
        if (check) {
          point = this.gameService.calculateAllEyes();
        }
        break;

      case 'Small Straight':
        if (this.checkStraight('SMALL')) {
          point = evaluation.value;
        }
        break;
      case 'Large Straight':
        if (this.checkStraight('LARGE')) {
          point = evaluation.value;
        }
        break;

      case 'Full House':
        if (this.gameService.checkFullHouse()) point = evaluation.value;
        break;

      case 'Yahtzee':
        if (this.gameService.checkYahtzee()) point = evaluation.value;
        break;

      case 'Chance':
        point = this.gameService.calculateAllEyes();
        break;
    }

    if (point === 0) return;

    evaluation.points[playerNumber] = point;
    this.evaluations.forEach(
      (e) => (e.isSelectDisabled[this.activePlayer] = true)
    );

    this.countRoll = 0;
    this.summaryPointsCalculator();
  }

  public initialize(): void {
    for (let countDices = 0; countDices < Constants.maxDices; countDices++) {
      this.templates[countDices] = this.zero;
      this.gameService.initializeByIndex(countDices);
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
    const clone = this.gameService.clone<IDice[]>(this.gameService.getDices());

    clone.sort((a: IDice, b: IDice) => {
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

  private summaryPointsCalculator(): void {
    const summaryPoints: number[] = [];
    for (let player = 0; player < Constants.maxPlayer; player++) {
      summaryPoints.push(0);
    }

    for (let points = 0; points < this.evaluations.length; points++) {
      const playerPoints = this.evaluations[points].points;
      for (let player = 0; player < Constants.maxPlayer; player++) {
        summaryPoints[player] += playerPoints[player];
      }
    }

    this.summaryPlayersPoints = summaryPoints;
  }
}
