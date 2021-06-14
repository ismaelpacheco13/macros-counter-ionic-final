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

  userUID: string;
  admins: String[] = [];

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
    this.ngFireAuth.authState.subscribe(async user => {
      if (user) {
        await this.getSetting();
        await this.getAdmins();
        this.userUID = user.uid;
      } else {
        this.router.navigate(['login']);
      }
    })

    
  }

  saveSettings() {
    this.settingsService.saveSettings(this.setting);
    this.router.navigate(['home']);
  }

  async getSetting() {
    if (await this.settingsService.getRealtimeSettings()) { // Si existen las settings (ya se han creado anteriormente)
      this.setting = await this.settingsService.getRealtimeSettings();
    }
  }

  async getAdmins() {
    if (await this.authService.getRealtimeAdminList()) { // Si existen los admins (ya se han creado anteriormente)
      this.admins = await this.authService.getRealtimeAdminList();
    }
  }

}
