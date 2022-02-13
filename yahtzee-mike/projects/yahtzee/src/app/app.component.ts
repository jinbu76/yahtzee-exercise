import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Constants } from './common/constants';
import { Evaluation } from './models/evaluation.interface';
import { IDice } from './models/dice.interface';
import { GameService } from './services/game.service';
import { environment } from '../environments/environment';
import { FormControl } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { Player } from './models/player.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
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
  public switchPlayerDisabled: boolean = true;
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

  public maxPlayers: number = environment.maxPlayers;
  public players: number[] = [];
  public countPlayers: FormControl;

  public subscription: Subscription = new Subscription();
  public intervallSubscription: Subscription = new Subscription();
  public playerSettings: boolean = false;

  public gameOver: boolean = false;

  public summaryPoints: number[] = [];
  public isShake: boolean = true;

  constructor(public gameService: GameService) {
    this.countPlayers = new FormControl(this.maxPlayers.toString());
  }

  ngOnInit(): void {
    this.initialize();

    this.subscription = this.countPlayers.valueChanges.subscribe((val) => {
      this.maxPlayers = Number.parseInt(val);
      this.ngOnInit();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

  public onShakeRoll(): void {
    if (this.isShake) {
      this.intervallSubscription = interval(150).subscribe(() => this.setRandomDiceValues());
    } else {
      this.intervallSubscription.unsubscribe();
      this.countRoll--;
    }

    this.isShake = !this.isShake;

  }

  public disabledSelect(evaluation: Evaluation): boolean {
    return evaluation.players[this.activePlayer].isSelectDisabled;
  }

  public switchPlayer(): void {
    this.countRoll = Constants.maxRolls;
    this.activePlayer++;
    if (this.activePlayer === this.maxPlayers) {
      this.activePlayer = 0;
    }
    this.gameService.setAllDicesIsSelected(false);

    this.evaluations.forEach((evaluation) => {
      const player = evaluation.players[this.activePlayer];
      if (player.point === 0 && player.isPlayable) {
        evaluation.players[this.activePlayer].isSelectDisabled = false;
      }
    });
    this.onShakeRoll();
    this.switchPlayerDisabled = true;
  }

  public selectDice(dice: IDice): void {
    dice.isSelected = !dice.isSelected;
  }

  public swipeAway(evaluation: Evaluation): void {
    this.setPlayerPoints(evaluation, 0);
    this.setGameOver();
  }

  getPlayerWinner(): string {
    const maxPoint: number = Math.max(...this.summaryPlayersPoints);
    const index: number = this.summaryPlayersPoints.indexOf(maxPoint) + 1;

    return 'Player ' + index;
  }

  public setClass(index: number) {
    if (!this.gameService.checkValidSelectedDice(index)) return '';
    return 'selected';
  }

  public addPoints(evaluation: Evaluation): void {
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

    this.setPlayerPoints(evaluation, point);

    this.countRoll = 0;
    this.summaryPointsCalculator(point);

    this.setGameOver();
  }

  public initialize(): void {
    this.countRoll = Constants.maxRolls;
    this.gameOver = false;
    this.playerSettings = false;
    this.countPlayers = new FormControl(this.maxPlayers.toString());

    this.isLoaded = false;
    this.switchPlayerDisabled = true;

    for (let countDices = 0; countDices < Constants.maxDices; countDices++) {
      this.templates[countDices] = this.zero;
      this.gameService.initializeByIndex(countDices);
    }

    this.summaryPlayersPoints = [];
    this.players = [];
    const playersInitialize: Player[] = [];
    for (let countPlayer = 0; countPlayer < this.maxPlayers; countPlayer++) {
      this.players.push(countPlayer + 1);
      this.summaryPlayersPoints.push(0);

      const player: Player = {
        point: 0,
        isPlayable: true,
        isSelectDisabled: false,
      };
      playersInitialize.push(player);
    }

    this.evaluations = [
      {
        name: 'Ones',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 1,
      },
      {
        name: 'Twos',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 2,
      },
      {
        name: 'Threes',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 3,
      },
      {
        name: 'Fours',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 4,
      },
      {
        name: 'Fives',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 5,
      },
      {
        name: 'Sixes',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 6,
      },
      {
        name: '3 of a kind',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: -1,
      },
      {
        name: '4 of a kind',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: -1,
      },
      {
        name: 'Small Straight',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 30,
      },
      {
        name: 'Large Straight',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 40,
      },
      {
        name: 'Full House',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 25,
      },
      {
        name: 'Yahtzee',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: 50,
      },
      {
        name: 'Chance',
        players: JSON.parse(JSON.stringify(playersInitialize)),
        value: -1,
      },
    ];
  }

  private setRandomDiceValues() {
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
  }

  private setGameOver(): void {
    let count = 0;
    this.evaluations.forEach(
      (evaluation) =>
        (count += evaluation.players.filter(
          (player) => player.isPlayable === true
        ).length)
    );

    this.gameOver = count === 0;
    this.switchPlayerDisabled = this.gameOver;
  }

  private setPlayerPoints(evaluation: Evaluation, point: number) {
    evaluation.players[this.activePlayer] = {
      point,
      isPlayable: false,
      isSelectDisabled: true,
    };
    this.evaluations.forEach(
      (e) => (e.players[this.activePlayer].isSelectDisabled = true)
    );
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

    if (
      type === 'SMALL' &&
      (countHit === Constants.maxDices - 2 ||
        countHit === Constants.maxDices - 1)
    )
      return true;
    if (type === 'LARGE' && countHit === Constants.maxDices - 1) return true;

    return false;
  }

  private summaryPointsCalculator(points: number): void {
    this.summaryPlayersPoints[this.activePlayer] += points;
  }
}
