import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Show User Team Assignment After Shuffle -->
    <div class="row">
      <section class="card">
        <div class="card-header">
          <span class="dot"></span>
          <span class="card-title" *ngIf="name">Welcome To ION Outing, {{name}}!</span>
          <span class="card-title" *ngIf="!name">Team Shuffle Completed!</span>
        </div>
        <div class="card-body">
          <h4 *ngIf="name && userTeam">
            🎉 Congratulations! You belong to <strong>{{userTeam}}</strong>!<br>
            Your team members are listed below - scroll down to see them! 👇
          </h4>
          <h4 *ngIf="!name || !userTeam">
            🎆 Teams have been successfully created! Scroll down to see all teams and their members! 👇
          </h4>
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
    .row{margin:20px 0}
    h4{color:#666;text-align:center}
  `]
})
export class WelcomeComponent {
  @Input() name = '';
  @Input() userTeam = '';
}