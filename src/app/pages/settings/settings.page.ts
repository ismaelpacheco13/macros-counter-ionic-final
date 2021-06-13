import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Setting } from 'src/app/model/setting';
import { SettingsService } from 'src/app/services/settings.service';
import { AuthenticationService } from '../../shared/authentication-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  setting: Setting = {age: 0, height: 0, weight: 0, sex: "", physicalActivity: ""
                     ,kcal: 0, bmr: 0, protein: 0, carbs: 0, fats: 0};

  constructor(
    private settingsService: SettingsService,
    private router: Router,
    public authService: AuthenticationService,
    private db: AngularFireDatabase,
    public ngFireAuth: AngularFireAuth
  ) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    if(!this.authService.isLoggedIn) {
      this.router.navigate(['login']);
    }
    
    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.getSetting();
      }
    })
  }

  saveSettings() {
    this.settingsService.saveSettings(this.setting);
    this.router.navigate(['home']);
  }

  async getSetting() {
    this.setting = await this.settingsService.getRealtimeSettings();
  }

}
