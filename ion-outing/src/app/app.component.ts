import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter, interval, Subscription } from 'rxjs';
import { ImageCarouselComponent } from './components/image-carousel/image-carousel.component';
import { BuzzerComponent } from './components/buzzer/buzzer.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { WelcomePopupComponent } from './components/welcome-popup/welcome-popup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FormsModule,CommonModule , HttpClientModule, ImageCarouselComponent, BuzzerComponent, WelcomeComponent, WelcomePopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'ion-outing';
  data: any = '';
  count = 0;
  name = '';
  gender = '';
  status = '';
players : any[] = [];
teams : any[] = [];
  numberOfTeams = 2;
  teamNames: string[] = ['Team A', 'Team B'];
  showTeamConfig = false;
  private refreshSub!: Subscription;
  isCreated = false
  isAdmin = false;
  activeTab = 'teams';
  allowDuplicateNames = false;
  showWelcomePopup = false;
  constructor(private http: HttpClient, private router: Router) {
    this.getPlayers();
    const name = localStorage.getItem('uerName');
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    console.log('hasSeenWelcome:', hasSeenWelcome);
    console.log('name:', name);
    
    if(name){
      this.name = name;
       this.isCreated = true;
    }
    
    // Show welcome popup for first-time visitors
    if (!hasSeenWelcome) {
      console.log('Showing welcome popup');
      this.showWelcomePopup = true;
    } else {
      console.log('Welcome popup already seen');
    }
    
    console.log('showWelcomePopup:', this.showWelcomePopup);
    
    this.refreshSub = interval(2000).subscribe(() => this.refresh());
  }
  ngOnInit(): void {
      this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      if (event.url.includes('admin')) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
    }
  ngOnDestroy(): void {
 if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
    }

  savePlayer(): void{
        const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
        this.http.post(host + '/api/addPlayer', {name: this.name, gender: this.gender}).subscribe((data: any)=>{
     if (!this.allowDuplicateNames) {
       localStorage.setItem('uerName', this.name);
       this.isCreated = true;
     }
     this.getPlayers();
    })
  }

  getPlayers(): void {
        const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.get(host + '/api/players').subscribe((data: any)=>{
      this.players = data.players;
    })  
  }
  refresh(): void {
        const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.get(host + '/api/refresh').subscribe((data: any)=>{
      this.status = data.status;
      this.players = data.players;
      if (data.shuffledTeams && data.shuffledTeams.length > 0) {
        this.teams = data.shuffledTeams;
      }
      // Check if current user still exists in players list
      if (this.name && this.isCreated) {
        const userExists = this.players.some(player => player.name === this.name);
        if (!userExists) {
          // User was deleted by admin, reset to registration form
          this.name = '';
          this.isCreated = false;
          localStorage.removeItem('uerName');
        }
      }
    })
  }

  showShuffleConfig(): void {
    this.showTeamConfig = true;
  }

  updateTeamCount(): void {
    this.teamNames = Array(this.numberOfTeams).fill('').map((_, i) => 
      this.teamNames[i] || `Team ${String.fromCharCode(65 + i)}`
    );
  }

  shuffle(): void {
    const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.post(host + '/api/shuffle', {
      numberOfTeams: this.numberOfTeams,
      teamNames: this.teamNames
    }).subscribe((data: any) => {
      this.status = data.status;
      this.players = data.players;
      this.teams = data.shuffledTeams;
      this.showTeamConfig = false;
    })
  }

    restShuffle(): void {
        const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.get(host + '/api/restShuffle').subscribe((data: any)=>{
      this.status = data.status;
      this.players = data.players;
      this.teams = [];
    })
  }

  addNew(): void {
    this.name = '';
    this.isCreated = false;
    localStorage.removeItem('uerName');
  }

  lock(): void {
        const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.get(host + '/api/lock').subscribe((data: any)=>{
      this.status = data.status;
      this.players = data.players;
    })
  }

  deletePlayer(player: any): void {
    const host = location.origin === 'http://localhost:4200' ? 'http://localhost:3000' : location.origin
    this.http.delete(host + '/api/deletePlayer', {
      body: { name: player.name, gender: player.gender }
    }).subscribe((data: any) => {
      this.getPlayers();
    })
  }

  getTeamLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getUserTeam(): string {
    if (!this.name || !this.teams || this.teams.length === 0) {
      return '';
    }
    
    for (let team of this.teams) {
      const member = team.members.find((m: any) => m.name === this.name);
      if (member) {
        return team.name;
      }
    }
    return '';
  }

  closeWelcomePopup(): void {
    console.log('Closing welcome popup');
    this.showWelcomePopup = false;
    localStorage.setItem('hasSeenWelcome', 'true');
  }
}
