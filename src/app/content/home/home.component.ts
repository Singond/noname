import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  isDevMode,
} from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { zeroPad } from 'src/app/shared/utils';
import { ConfigService } from 'src/app/shared/config.service';

interface timeComponents {
  milisecondsToDday: string;
  secondsToDday: string;
  minutesToDday: string;
  hoursToDday: string;
  daysToDday: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  public timeLeft$: Observable<timeComponents>;
  @ViewChild('homeContainer') homeContainer: ElementRef | undefined;
  audioElement =
    document.getElementById('audio-tik-tok') != null
      ? document.getElementById('audio-tik-tok')
      : document.createElement('audio');
  bodyElement = document.getElementById('app-body');
  private configService: ConfigService = inject(ConfigService);
  public title: String = "Noname";
  public subtitle: String = "Experience Event 2025";
  public eventStart: Date = new Date();

  ngAfterViewInit() {
    if (!isDevMode() && this.audioElement != null) {
      this.audioElement.setAttribute('src', 'assets/audio/30sTicTac.mp3');
      this.audioElement.setAttribute('loop', 'true');
      this.audioElement.setAttribute('id', 'audio-tik-tok');
      this.audioElement.setAttribute('preload', 'auto');
      this.audioElement.setAttribute('autoplay', 'true');
      if (this.bodyElement != null) {
        this.bodyElement.appendChild(this.audioElement);
        setTimeout(() => {
          if (this.audioElement != null) {
            (this.audioElement as any).play();
          }
        }, 5000);
      }
    }
  }

  calcDateDiff(
    endDay: Date = this.eventStart,
  ): timeComponents {
    const dDay = endDay.valueOf();

    const milliSecondsInASecond = 1000;
    const hoursInADay = 24;
    const minutesInAnHour = 60;
    const secondsInAMinute = 60;

    const timeDifference = Math.abs(dDay - Date.now());

    const daysToDday = Math.floor(
      timeDifference /
        (milliSecondsInASecond *
          minutesInAnHour *
          secondsInAMinute *
          hoursInADay),
    );

    const hoursToDday = Math.floor(
      (timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute)) %
        hoursInADay,
    );

    const minutesToDday = Math.floor(
      (timeDifference / (milliSecondsInASecond * minutesInAnHour)) %
        secondsInAMinute,
    );

    const secondsToDday =
      Math.floor(timeDifference / milliSecondsInASecond) % secondsInAMinute;

    const milisecondsToDday = Math.floor(
      timeDifference % milliSecondsInASecond,
    );

    return {
      milisecondsToDday: zeroPad(
        milisecondsToDday < 0
          ? Math.abs(milisecondsToDday + 1)
          : milisecondsToDday,
        3,
      ),
      secondsToDday: zeroPad(
        secondsToDday < 0 ? Math.abs(secondsToDday + 1) : secondsToDday,
        2,
      ),
      minutesToDday: zeroPad(
        minutesToDday < 0 ? Math.abs(minutesToDday + 1) : minutesToDday,
        2,
      ),
      hoursToDday: zeroPad(
        hoursToDday < 0 ? Math.abs(hoursToDday + 1) : hoursToDday,
        2,
      ),
      daysToDday: zeroPad(
        daysToDday < 0 ? Math.abs(daysToDday + 1) : daysToDday,
        2,
      ),
    };
  }

  constructor() {
    this.timeLeft$ = interval(50).pipe(
      map(x => this.calcDateDiff()),
      shareReplay(1),
    );
  }

  async ngOnInit() {
    await this.configService.initializeConfig();
    this.title = this.configService.getString('title');
    this.subtitle = this.configService.getString('subtitle');
    this.eventStart = this.configService.getEventStart();
  }

  ngOnDestroy(): void {
    if (this.bodyElement != null) {
      (this.audioElement as any).pause();
      setInterval(() => {
        (this.audioElement as any).pause();
      }, 1000);
    }
  }
}
