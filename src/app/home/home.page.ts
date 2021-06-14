import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Food } from '../model/food';
import { Setting } from '../model/setting';
import { FoodsService } from '../services/foods.service';
import { SettingsService } from '../services/settings.service';
import { AuthenticationService } from '../shared/authentication-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  breakfast: Food[] = [];
  lunch: Food[] = [];
  dinner: Food[] = [];
  kcal: number = 0;
  kcalMax: number = 0;
  protein: number = 0;
  proteinMax: number = 0;
  carbs: number = 0;
  carbsMax: number = 0;
  fats: number = 0;
  fatsMax: number = 0;
  proteinBar: number = 0;
  carbsBar: number = 0;
  fatsBar: number = 0;
  setting: Setting;
  date: string;

  constructor(
    private foodsService: FoodsService,
    private settingsService: SettingsService,
    private alertController: AlertController,
    private router: Router,
    public authService: AuthenticationService,
    public ngFireAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.date = new Date().toISOString();
    this.date = this.date.split('T')[0];
    localStorage.setItem('date', this.date);

    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.authService.createRealtimeUser(user);
      }
    })
  }

  ionViewWillEnter() {
    this.ngFireAuth.authState.subscribe(user => { // Espera a que cargue el uid antes de cargar las comidas
      if (user) {
        this.getFoods();
      } else {
        this.router.navigate(['login']);
      }
    })
  }

  async goEditFood(id: string) {
    await this.router.navigateByUrl(`/edit${id != undefined ? '/' + id : ''}`);
  }

  changeDate() {
    
    this.date = this.date.split('T')[0];
    localStorage.setItem('date', this.date);
    console.log('fecha cambiada');

    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.getFoods();
      }
    })
  }

  updateMacros() {
    this.kcal = 0;
    this.protein = 0;
    this.carbs = 0;
    this.fats = 0;

    this.breakfast.forEach(food => {
      this.kcal += food.kcal;
      this.protein += food.protein;
      this.carbs += food.carbs;
      this.fats += food.fats;
    });

    this.lunch.forEach(food => {
      this.kcal += food.kcal;
      this.protein += food.protein;
      this.carbs += food.carbs;
      this.fats += food.fats;
    });

    this.dinner.forEach(food => {
      this.kcal += food.kcal;
      this.protein += food.protein;
      this.carbs += food.carbs;
      this.fats += food.fats;
    });
  }

  async updateMacrosMax() {
    this.setting = await this.settingsService.getRealtimeSettings();
    if (this.setting) {
      this.kcalMax = this.setting.kcal;
      this.proteinMax = this.setting.protein;
      this.carbsMax = this.setting.carbs;
      this.fatsMax = this.setting.fats;
    }
  }

  updateProgressBars() {
    this.proteinBar = this.protein / this.proteinMax;
    this.carbsBar = this.carbs / this.carbsMax;
    this.fatsBar = this.fats / this.fatsMax;
  }




  async presentAlert(f: Food) {
    const alert = await this.alertController.create({
      header: `${f.name}`,
      message: `Gr / ml: ${f.grml} gr / ml` + 
               `<br>Kcal: ${f.kcal} kcal` +
               `<br>Proteina: ${f.protein} gr` +
               `<br>Carbos: ${f.carbs} gr` +
               `<br>Grasas: ${f.fats} gr`,
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
        }, {
          text: 'Editar',
          handler: () => {
            localStorage.setItem('food', JSON.stringify(f));
            this.goEditFood(f.id);
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertConfirm(f: Food) {
    const alert = await this.alertController.create({
      header: 'Borrar comida',
      message: `¿Estás seguro que quieres borrar la comida <strong>${f.name}</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.foodsService.deleteRealtimeFood(f);
            this.getFoods();
          }
        }
      ]
    });

    await alert.present();
  }

  async getFoods() {
    this.breakfast = [];
    this.lunch = [];
    this.dinner = [];
    await this.foodsService.getRealtimeFoodBreakfastList(this.breakfast);
    await this.foodsService.getRealtimeFoodLunchList(this.lunch);
    await this.foodsService.getRealtimeFoodDinnerList(this.dinner);

    this.updateMacros();
    await this.updateMacrosMax();
    this.updateProgressBars();
  }
}
