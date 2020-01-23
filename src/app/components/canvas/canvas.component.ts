import { Component, Input, ElementRef, AfterViewInit, OnInit, ViewChild, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class CanvasComponent implements OnInit, AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvas: ElementRef;
  @Input() public game;
  @Input() public home;
  @Input() public away;
  @Input() public width = 800;
  @Input() public height = 600;

  private cx: CanvasRenderingContext2D;
  private rect;

  constructor() { }

  ngOnInit() {  }

  onResize(event){
    console.log("onResize:", event.target.innerWidth);
    this.initCanvas(event.target.innerWidth * 0.9, event.target.innerHeight * 0.5);

    if (this.game) {
      this.drawHeader(this.game);
    }
    if (this.home) {
      this.drawGraphs(this.home, '#ff0000', 1);
    }
    if (this.away) {
      this.drawGraphs(this.away, '#0000ff', 0);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const gameChange: SimpleChange = changes.game;
    if (gameChange) {
      this.game = gameChange.currentValue;
      this.home = null;
      this.away = null;
      //this.initCanvas(this.width, this.height);
      //this.drawHeader();
      window.dispatchEvent(new Event('resize'));
    }
    const homeChange: SimpleChange = changes.home;
    if (homeChange) {
      this.home = homeChange.currentValue;
      this.drawGraphs(this.home, '#ff0000', 1);
    }
    const awayChange: SimpleChange = changes.away;
    if (awayChange) {
      this.away = awayChange.currentValue;
      this.drawGraphs(this.away, '#0000ff', 0);
    }
    this.ngAfterViewInit();
  }

  public ngAfterViewInit() {

    //this.initCanvas(this.width, this.height);
    //window.dispatchEvent(new Event('resize'));
  }

  public initCanvas(width, height) {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

    canvasEl.onclick = function(event) {
      var rect = canvasEl.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      console.log("x: " + x + " y: " + y);
    }

    this.cx = canvasEl.getContext('2d');
    if (!this.cx) { return; }

    canvasEl.width = width;
    canvasEl.height = height;

    const rect = canvasEl.getBoundingClientRect();
    this.rect = rect;

    this.cx.lineWidth = 1;
    this.cx.lineCap = 'butt';
    this.cx.strokeStyle = '#000';

    this.drawHeader(this.game);
    //this.drawGraphs(this.home, '#ff0000', 1);
    //this.drawGraphs(this.away, '#0000ff', 0);
  }

  drawHeader(game) {
    if (this.cx) {
      this.cx.clearRect(0, 0, this.rect.width, this.rect.height);
      this.cx.beginPath();
      this.cx.strokeStyle = '#767676';
      this.cx.moveTo(0, this.rect.height/2);
      this.cx.lineTo(this.rect.width, this.rect.height/2);
      this.cx.stroke();
      this.cx.font = '30px serif';
      this.cx.fillStyle = '#ff0000';
      this.cx.fillText(game.homeTeamName, 10, 40);
      var textLen = this.cx.measureText(game.homeTeamName);
      this.cx.fillStyle = '#0000ff';
      this.cx.fillText(game.awayTeamName, textLen.width + 20, 40);
      this.cx.stroke();
      this.cx.font = '10px serif';
      this.cx.fillStyle = '#323232';
      this.cx.fillText("dotted: Avg  3d", 10, 56);
      this.cx.fillText("solid:  Avg 10d", 10, 70);
      this.cx.stroke();
    }
  }

  drawGraphs(inData, color, isHome) {
    if (!(inData && inData.length)) {
      return;
    }
    let data = inData.slice(0, 80)
    let row_fix = inData.length -  data.length;
    if (this.cx && this.rect && data) {
      var height = this.rect.height;
      var v_len = height / 100;
      var h_len = this.rect.width / (data.length + 1);

      this.drawMovingAvg(data, "gameMovingAvg3", color, true, row_fix);
      this.drawMovingAvg(data, "gameMovingAvg10", color, false, row_fix);
      this.drawLocation(data, isHome, row_fix);

      this.cx.lineWidth = 1;
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var centerX = h_len * (item.row_num - row_fix);
        var centerY = height - (item.performance * v_len);
        if (item.overtime === 1) {
          this.cx.beginPath();
          this.cx.strokeStyle = color;
          this.cx.fillStyle = color;
          this.cx.fillRect(centerX - 7, centerY - 7, 14, 14);
          this.cx.fill();
          this.cx.stroke();
        }
        this.cx.beginPath();
        this.cx.strokeStyle = color;
        this.cx.fillStyle = color;
        this.cx.ellipse(centerX, centerY, 5, 5, 0, 0, Math.PI*2, false);
        this.cx.fill();
        this.cx.stroke();
        if (item.outcome === "L") {
          this.cx.beginPath();
          this.cx.strokeStyle = '#fff';
          this.cx.fillStyle = '#fff';
          this.cx.fillRect(centerX - 3, centerY - 3, 6, 6);
          this.cx.fill();
          this.cx.stroke();
        }
      }
    }
  }

  drawMovingAvg(data, column, color, isDash, row_fix) {
    var height = this.rect.height;
    var v_len = height / 100;
    var h_len = this.rect.width / (data.length + 1);

    this.cx.save();
    if (isDash)
      this.cx.setLineDash([1,2]);
    else
      this.cx.setLineDash([]);

    var maxValue = 0;
    var minValue = 9999;
    var i = 0;
    for (i = 0; i < data.length; i++) {
      if (data[i][column] > maxValue)
        maxValue = data[i][column];
      if (data[i][column] < minValue)
        minValue = data[i][column];
    }

    for (i = 1; i < data.length; i++) {
      var start = data[i-1];
      var end = data[i];
      this.cx.beginPath();
      this.cx.strokeStyle = color;

      if (start.location === 'H')
        this.cx.lineWidth = 2;
      else
        this.cx.lineWidth = 1;

      this.cx.moveTo(h_len * (start.row_num - row_fix), height - (start[column] * v_len));
      this.cx.lineTo(h_len * (end.row_num - row_fix), height - (end[column] * v_len));

      this.cx.stroke();
    }
    this.cx.restore();
  }

  daysBetween(date1, date2) {
    var from = new Date(date1);
    var to = new Date(date2);
    var timeDiff = Math.abs(from.getTime() - to.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  drawLocation(data, isHome, row_fix) {
    //var height = this.rect.height;
    var y = this.rect.height - ((isHome === 1) ? 20 : 10);
    var h_len = this.rect.width / (data.length + 1);

    this.cx.save();
    this.cx.font = '10px serif';
    if (isHome) {
      this.cx.fillStyle = '#ff0000';
      this.cx.fillText("H", 2, y + 4);
    }
    else {
      this.cx.fillStyle = '#0000ff';
      this.cx.fillText("A", 2, y + 4);
    }
    this.cx.setLineDash([]);
    this.cx.lineWidth = 3;
    var i = 0
    for (i = 0; i < data.length; i++) {
      var item = data[i];
      var daysBefore = 0;
      if (i < data.length -1) {
        var prev = data[i+1];
        daysBefore = this.daysBetween(item.gameDate, prev.gameDate);
      }
      this.cx.beginPath();

      if (item.location === 'H')
        this.cx.strokeStyle = '#ff1111';
      else
        this.cx.strokeStyle = '#1111ff'

      this.cx.moveTo(h_len * (item.row_num - row_fix), y);
      this.cx.lineTo(h_len * (item.row_num - row_fix) - h_len + (h_len / 3), y);
      var lineLen = (h_len * (item.row_num - row_fix)) - (h_len * (item.row_num - row_fix) - h_len + (h_len / 3));
      this.cx.stroke();
      if (item.outcome === "W") {
        this.cx.save();
        this.cx.beginPath();
        this.cx.strokeStyle = '#000';
        this.cx.fillStyle = '#000';
        this.cx.fillRect(h_len * (item.row_num - row_fix) - 3, y - 3, 6, 6);
        this.cx.fill();
        this.cx.stroke();
        this.cx.restore();
      }
      if (daysBefore > 1) {
        var lineCaps = (daysBefore > 3 ? 3 : daysBefore - 1);
        var lineCap = (h_len - (h_len / 3)) / 4;
        this.cx.beginPath();
        this.cx.strokeStyle = '#000';
        this.cx.fillStyle = '#000';
        var j = 0
        for (j = 1; j <= lineCaps; j++) {
          this.cx.fillRect(h_len * (item.row_num - row_fix) - lineLen + (lineCap * j) - 1, y - 4, 2, 8);
          this.cx.fill();
        }
        this.cx.stroke();

      }
    }
    this.cx.restore();
  }
}
