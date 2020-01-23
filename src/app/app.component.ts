import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { _ } from 'underscore';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'NHL Schedules';
  public scheduledGames: Observable<[]>;
  public homePerformance: Observable<[]>;
  public awayPerformance: Observable<[]>;
  public gameEvents: Observable<[]>;
  public selectedGame;
  public isPlayingOnServer = false;
  public selectedDate;
  public searchTerm;

  constructor(
    private storeService: StoreService
  ) {
    let selectedDate = new Date();
    selectedDate.setUTCHours(0, 0, 0, 0);
    this.selectedDate = selectedDate;
    this.searchTerm = selectedDate.toISOString().slice(0,10);

    var metadata = {"table": "NHLGame",
      "where": [JSON.stringify([{"gameDate = ": this.searchTerm}])],
      "order": "gamePk"};

    this.storeService.selectAll(metadata)
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           this.scheduledGames = _.uniq(event.body, "gamePk");
       }
     }),
     err => {
       console.log("Error occured.")
     };
  }

  selectDate(change) {
    var d = new Date(this.selectedDate);
    d.setDate(d.getDate() + change);

    this.selectedDate = d;
    this.searchTerm = this.selectedDate.toISOString().slice(0,10);
    this.gamesOnDate();
  }

  gamesOnDate() {
    this.selectedGame = null;

    var metadata = {"table": "NHLGame",
      "where": [JSON.stringify([{"gameDate = ": this.searchTerm}])],
      "order": "gamePk"};

    this.storeService.selectAll(metadata)
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           this.scheduledGames = event.body;
       }
     }),
     err => {
       console.log("Error occured.")
     };
  }

  ngOnInit() {
    /*
    this.storeService.audioPcm("http://www.music.helsinki.fi/tmt/opetus/uusmedia/esim/a2002011001-e02-128k.mp3")
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           console.log("audio pcm", event.body);
       }
     }),
     err => {
       console.log("Error occured. no audio pcm")
     };
     */
  }
  /*
  stopAudioOnServer() {
    this.storeService.stopAudioOnServer()
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           console.log("audio pcm", event.body);
       }
     }),
     err => {
       console.log("Error occured. no audio pcm")
     };
  }
  startAudioOnServer() {
    this.storeService.playAudioOnServer("http://www.music.helsinki.fi/tmt/opetus/uusmedia/esim/a2002011001-e02-128k.mp3")
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           console.log("audio pcm", event.body);
       }
     }),
     err => {
       console.log("Error occured. no audio pcm")
     };
  }
  */
  gameSelected(game) {
    this.selectedGame = game;
    this.gameEvents = null ;
    this.fetchHomePerformance(game);
    this.fetchAwayPerformance(game);
    this.fetchGameEvents(game);
    game.homeGameInfo = "";
    game.awayGameInfo = "";

    /*
    console.log("this.isPlayingOnServer", this.isPlayingOnServer);
    if (this.isPlayingOnServer) {
      this.stopAudioOnServer();
    }
    else {
      this.startAudioOnServer();
    }
    this.isPlayingOnServer = !this.isPlayingOnServer;
    */
  }

  fetchHomePerformance(game) {
    var metadata = {"table": "vPerformanceMA",
      "where": [JSON.stringify([{"team = ": game.homeTeamName}, {"gameDate < ": this.searchTerm}])],
      "order": "row_num desc"};


    this.storeService.selectAll(metadata)
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           this.homePerformance = event.body;
           if (this.homePerformance) {
             var preGame = this.homePerformance[0];
             var days = this.daysBetween(game.gameDate, preGame.gameDate);
             game.homeGameInfo = preGame.location + (days-1) + preGame.outcome + ' ' + preGame.finalScore;
           }
           else {
             game.homeGameInfo = "n/a";
           }
       }
     }),
     err => {
       console.log("Error occured.")
     };
  }
  fetchAwayPerformance(game) {
    var metadata = {"table": "vPerformanceMA",
      "where": [JSON.stringify([{"team = ": game.awayTeamName}, {"gameDate < ": this.searchTerm}])],
      "order": "row_num desc"};

    this.storeService.selectAll(metadata)
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           this.awayPerformance = event.body;
           if (this.awayPerformance) {
             var preGame = this.awayPerformance[0];
             var days = this.daysBetween(game.gameDate, preGame.gameDate);
             game.awayGameInfo = preGame.location + (days-1) + preGame.outcome + ' ' + preGame.finalScore;
           }
           else {
             game.awayGameInfo = "n/a";
           }
       }
     }),
     err => {
       console.log("Error occured.")
     };
  }
  fetchGameEvents(game) {
    var metadata = {"table": "vGameEventsNHL",
      "where": [JSON.stringify([{"gamePk = ": game.gamePk}])]
    };

    this.storeService.selectAll(metadata)
     .subscribe((event: HttpEvent<any>) => {
       switch (event.type) {
         case HttpEventType.Response:
           this.gameEvents = event.body;
           console.log(this.gameEvents)
       }
     }),
     err => {
       console.log("Error occured.")
     };
  }
  daysBetween(date1, date2) {
    var from = new Date(date1);
    var to = new Date(date2);
    var timeDiff = Math.abs(from.getTime() - to.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
