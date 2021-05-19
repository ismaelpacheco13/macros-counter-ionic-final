import { Injectable } from '@angular/core';
import { Setting } from '../model/setting';

import {Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  setting: Setting = {age: 0, height: 0, weight: 0, sex: "", physicalActivity: ""
                     ,kcal: 0, bmr: 0, protein: 0, carbs: 0, fats: 0};

  constructor() {
    this.getSettingFromStorage().then(
      data => this.setting = data
    );
  }

  getSetting() {
    return this.setting;
  }

  public async getSettingFromStorage(): Promise<Setting> {
    const item = await Storage.get({key: 'setting' });
    return JSON.parse(item.value);
  }

  public async saveSettings(s: Setting) {
    // Calculo de calorías metabolismo basal (Fórmula de Harris-Benedict)
    if (s.sex == "male") {
      s.bmr = 66.473 + (13.751 * s.weight) + (5.0033 * s.height) - (6.7550 * s.age);
    } else {
      s.bmr = 655.1 + (9.463 * s.weight) + (1.8 * s.height) - (4.6756 * s.age);
    }

    // Cálculo del requerimiento calórico basado en la actividad
    if (s.physicalActivity == "sedentario") {
      s.kcal = s.bmr * 1.2;
    } else if (s.physicalActivity == "leve") {
      s.kcal = s.bmr * 1.375;
    } else if (s.physicalActivity == "moderado") {
      s.kcal = s.bmr * 1.55;
    } else if (s.physicalActivity == "activo") {
      s.kcal = s.bmr * 1.725;
    } else {
      s.kcal = s.bmr * 1.9;
    }

    // Cálculo del requerimiento calórico basado en el objetivo (perder, mantener o ganar peso)
    if (s.goal == "loseFast") {
      s.kcal -= (s.kcal * 0.2);
    } else if (s.goal == "lose") {
      s.kcal -= (s.kcal * 0.1);
    } else if (s.goal == "maintain") {
      // Se mantiene igual
    } else if (s.goal == "gain") {
      s.kcal += (s.kcal * 0.1);
    } else {
      s.kcal += (s.kcal * 0.2);
    }

    // Cálculo de proteinas, hidratos y grasas
    s.protein = (s.kcal * 0.25) / 4; // Las proteinas son un 25% de las calorias y aproximadamente 4 calorias por gramo
    s.carbs = (s.kcal * 0.5) / 4; // Los carbohidratos son un 50% de las calorias y aproximadamente 4 calorias por gramo
    s.fats = (s.kcal * 0.25) / 9; // Las grasas son un 25% de las calorias y aproximadamente 9 calorias por gramo
    
    this.setting = s;

    await this.saveSetting(this.setting);
  }

  public async saveSetting(setting: Setting) {
    await Storage.set({
      key: 'setting',
      value: JSON.stringify(setting)
    });
  }
}
