import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Food } from '../model/food';
import { Setting } from '../model/setting';
import { FoodsService } from '../services/foods.service';
import { SettingsService } from '../services/settings.service';

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

  constructor(
    private foodsService: FoodsService,
    private settingsService: SettingsService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.breakfast = this.foodsService.getBreakfast();
    this.lunch = this.foodsService.getLunch();
    this.dinner = this.foodsService.getDinner();
  }

  ionViewWillEnter() {
    this.breakfast = this.foodsService.getBreakfast();
    this.lunch = this.foodsService.getLunch();
    this.dinner = this.foodsService.getDinner();

    this.updateMacros();
    this.updateMacrosMax();
    this.updateProgressBars();
  }

  goEditFood(id: number) {
    this.router.navigateByUrl(`/edit${id != undefined ? '/' + id : ''}`);
  }

  deleteFood(id: number) {
    this.foodsService.deleteFood(id);
    if (this.breakfast.find(f => f.id === id)) {
      this.breakfast = this.foodsService.getBreakfast();
    } else if (this.lunch.find(f => f.id === id)) {
      this.lunch = this.foodsService.getLunch();
    } else {
      this.dinner = this.foodsService.getDinner();
    }
    this.updateMacros();
    this.updateProgressBars();
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

  updateMacrosMax() {
    this.setting = this.settingsService.getSetting();
    this.kcalMax = this.setting.kcal;
    this.proteinMax = this.setting.protein;
    this.carbsMax = this.setting.carbs;
    this.fatsMax = this.setting.fats;
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
      message: `¿Estás seguro que quieres borrar la tarea <strong>${f.name}</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.deleteFood(f.id);
          }
        }
      ]
    });

    await alert.present();
  }

}
