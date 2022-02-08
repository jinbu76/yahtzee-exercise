import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Constants } from '../common/constants';
import { Evaluation } from './models/evaluationinterface';

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

  public dices: number[] = [];
  // @ts-ignore
  public templates: Array<TemplateRef<any>> = [];

  public isLoaded: boolean = false;

  constructor() {
    this.restart();
  }

  ngAfterViewInit(): void {
    for (let countDices = 0; countDices < Constants.maxDices; countDices++) {
      this.templates[countDices] = this.zero;
    }

    setTimeout(() => (this.isLoaded = true), 0);
  }

  public onRoll(): void {
    for (let dice = 0; dice < Constants.maxDices; dice++) {
      const random = Math.floor(Math.random() * (Constants.maxDices - 1) + 1);
      this.dices[dice] = random;

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

  public restart() {
    this.evaluations = [
      { name: 'Aces', players: [0, 0] },
      { name: 'Twos', players: [0, 0] },
      { name: 'Threes', players: [0, 0] },
      { name: 'Fours', players: [0, 0] },
      { name: 'Fives', players: [0, 0] },
      { name: 'Sixes', players: [0, 0] },
      { name: '3 of a kind', players: [0, 0] },
      { name: '4 of a kind', players: [0, 0] },
      { name: 'Small Straight', players: [0, 0] },
      { name: 'Large Straight', players: [0, 0] },
      { name: 'Full House', players: [0, 0] },
      { name: 'Yahtzee', players: [0, 0] },
      { name: 'Chance', players: [0, 0] },
    ];
  }
}
