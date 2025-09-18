import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-buzzer',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <!-- Admin Controls -->
    <div class="row" *ngIf="isAdmin">
      <section class="card">
        <div class="card-header">
          <span class="dot"></span>
          <span class="card-title">Admin Controls</span>
        </div>
        <div class="card-body">
          <button class="btn" (click)="resetBuzzer()">Reset Buzzer</button>
          <p *ngIf="buzzerStartTime" style="color:#28a745;font-weight:bold;color:#333">✅ Buzzer is ACTIVE - Started at: {{formatTime(buzzerStartTime)}}</p>
          <p *ngIf="!buzzerStartTime" style="color:#333;font-weight:bold">❌ Buzzer is INACTIVE - Click Reset to start</p>
        </div>
      </section>
    </div>
    
    <!-- User Buzzer Interface -->
    <div class="row" *ngIf="!isAdmin">
      <section class="card">
        <div class="card-header">
          <span class="dot"></span>
          <span class="card-title">Team Buzzer</span>
        </div>
        <div class="card-body">
          <div>
            <label for="teamName">Team Name</label>
            <input id="teamName" type="text" [(ngModel)]="buzzerTeamName" placeholder="Enter your team name" />
          </div>
          <button class="buzzer-btn" (click)="pressBuzzer()" [disabled]="!buzzerStartTime || !buzzerTeamName">🔔<br>BUZZ</button>
          <p *ngIf="!buzzerStartTime" style="text-align:center;color:#333;margin-top:10px">Waiting for admin to start...</p>
          <p *ngIf="buzzerStartTime && !buzzerTeamName" style="text-align:center;color:#333;margin-top:10px">Enter team name to enable buzzer</p>
        </div>
      </section>
    </div>
    
    <!-- Results Display -->
    <div class="row">
      <section class="card">
        <div class="card-header">
          <span class="dot"></span>
          <span class="card-title">Results</span>
        </div>
        <div class="card-body">
          <div *ngIf="buzzerResults.length === 0">No results yet...</div>
          <div class="result-item" *ngFor="let result of buzzerResults; let i = index">
            <span class="rank">{{i + 1}}</span>
            <span class="team-name">{{result.teamName}}</span>
            <span class="time">{{formatElapsedTime(result.time)}}</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .card{background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.1);overflow:hidden;margin-bottom:20px;border:2px solid #ff6b6b}
    .card-header{background:linear-gradient(135deg,#ff6b6b 0%,#ee5a52 100%);color:white;padding:15px 20px;display:flex;align-items:center;gap:10px}
    .card-title{font-weight:bold;font-size:18px;color:white}
    .card-body{padding:15px}
    .dot{width:12px;height:12px;background:white;border-radius:50%;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .btn{padding:12px 24px;font-size:16px;margin:5px;min-height:44px;border:none;border-radius:8px;background:#ff6b6b;color:white;cursor:pointer;transition:background .3s;font-weight:600}
    .btn:hover{background:#ee5a52}
    input{padding:12px;font-size:16px;min-height:44px;border:2px solid #ddd;border-radius:8px;width:100%;box-sizing:border-box;margin-bottom:10px;color:#333;background:white}
    input:focus{outline:none;border-color:#ff6b6b;color:#333}
    label{display:block;margin-bottom:5px;font-weight:500;color:#333}
    .row{margin:20px 0}
    .buzzer-btn{font-size:18px;padding:0;background:#ff6b6b;color:white;border:none;border-radius:50%;width:120px;height:120px;cursor:pointer;transition:all .3s;margin:20px auto;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.2}
    .buzzer-btn:hover:not(:disabled){background:#ee5a52;transform:scale(1.1)}
    .buzzer-btn:disabled{background:#ccc;cursor:not-allowed}
    .result-item{display:flex;justify-content:space-between;align-items:center;padding:12px;margin:8px 0;background:#f8f9fa;border-radius:8px;border-left:4px solid #ff6b6b}
    .rank{font-weight:bold;color:#ff6b6b;font-size:18px;min-width:30px}
    .team-name{flex:1;margin:0 15px;font-weight:500;color:#333}
    .time{font-family:monospace;font-weight:bold;color:#333}
  `]
})
export class BuzzerComponent implements OnInit, OnDestroy {
  @Input() isAdmin = false;
  buzzerTeamName = '';
  buzzerStartTime: number | null = null;
  buzzerResults: any[] = [];
  private refreshSub!: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getBuzzerResults();
    this.refreshSub = interval(2000).subscribe(() => this.getBuzzerResults());
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

  resetBuzzer(): void {
    console.log('Reset button clicked');
    const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    console.log('Making request to:', host + '/api/buzzer/reset');
    this.http.post(host + '/api/buzzer/reset', {}).subscribe({
      next: (data: any) => {
        this.buzzerStartTime = data.startTime;
        this.buzzerResults = [];
        console.log('Buzzer reset successful:', { startTime: this.buzzerStartTime, data });
      },
      error: (error) => {
        console.error('Buzzer reset failed:', error);
      }
    })
  }

  pressBuzzer(): void {
    if (!this.buzzerTeamName) return;
    
    const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.post(host + '/api/buzzer/press', { teamName: this.buzzerTeamName }).subscribe((data: any) => {
      if (data.status === 'recorded') {
        this.getBuzzerResults();
      }
    })
  }

  getBuzzerResults(): void {
    const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.get(host + '/api/buzzer/results').subscribe({
      next: (data: any) => {
        this.buzzerResults = data.results;
        this.buzzerStartTime = data.startTime;
        console.log('Buzzer state:', { startTime: this.buzzerStartTime, isActive: data.isActive, results: this.buzzerResults });
      },
      error: (error) => {
        console.error('Failed to get buzzer results:', error);
      }
    })
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  formatElapsedTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    return `${seconds}.${ms.toString().padStart(3, '0')}s`;
  }
}