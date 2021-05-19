import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Setting } from 'src/app/model/setting';
import { SettingsService } from 'src/app/services/settings.service';

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
    private router: Router
  ) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.setting = this.settingsService.getSetting();
  }

  saveSettings() {
    this.settingsService.saveSettings(this.setting);
    this.router.navigateByUrl('/');
  }

}
