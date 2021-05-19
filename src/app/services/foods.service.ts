import { Injectable } from '@angular/core';
import { Food } from '../model/food';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class FoodsService {

  breakfast: Food[] = [];
  lunch: Food[] = [];
  dinner: Food[] = [];
  foodCounter: number = 0;

  constructor(
  ) {
    /* this.breakfast = [
      {
        id: 0,
        name: "Plátano",
        grml: 140,
        kcal: 105,
        protein: 1.29,
        carbs: 27,
        fats: 0.39
      },
      {
        id: 1,
        name: "Vaso de leche",
        grml: 250,
        kcal: 146,
        protein: 7.86,
        carbs: 11,
        fats: 7.93
      }
    ];

    this.lunch = [
      {
        id: 2,
        name: "Arroz basmati",
        grml: 100,
        kcal: 344,
        protein: 7.6,
        carbs: 75,
        fats: 1
      },
      {
        id: 3,
        name: "Atún",
        grml: 160,
        kcal: 155,
        protein: 33.6,
        carbs: 1.6,
        fats: 1.6
      }
    ];

    this.dinner = [
      {
        id: 4,
        name: "Pasta-Lazos",
        grml: 100,
        kcal: 358,
        protein: 12,
        carbs: 72,
        fats: 1.5
      },
      {
        id: 5,
        name: "Aceite de Oliva",
        grml: 10,
        kcal: 90,
        protein: 0,
        carbs: 0,
        fats: 10
      }
    ]; */

    this.getBreakFastFromStorage().then( // Persistencia
      data => this.breakfast = data
    );

    this.getLunchFromStorage().then( // Persistencia
      data => this.lunch = data
    );

    this.getDinnerFromStorage().then( // Persistencia
      data => this.dinner = data
    );

    this.getFoodCounterFromStorage().then( // Persistencia
      data => this.foodCounter = data
    );

  }

  public getSingleFood(id: number): Food {
    if (this.breakfast.find(f => f.id === id)) {
      return this.breakfast.filter(f => f.id === id)[0];
    } else if (this.lunch.find(f => f.id === id)) {
      return this.lunch.filter(f => f.id === id)[0];
    } else {
      return this.dinner.filter(f => f.id === id)[0];
    }
  }

  public getTypeOfFood(id: number): string {
    if (this.breakfast.find(f => f.id === id)) {
      return "breakfast";
    } else if (this.lunch.find(f => f.id === id)) {
      return "lunch";
    } else {
      return "dinner";
    }
  }

  public getBreakfast(): Food[] {
    return this.breakfast;
  }

  public async getBreakFastFromStorage(): Promise<Food[]> { // Persistencia
    const ret = await Storage.get({ key: 'breakfast' });
    return JSON.parse(ret.value) ? JSON.parse(ret.value) : [];
  }

  public async getLunchFromStorage(): Promise<Food[]> { // Persistencia
    const ret = await Storage.get({ key: 'lunch' });
    return JSON.parse(ret.value) ? JSON.parse(ret.value) : [];
  }

  public async getDinnerFromStorage(): Promise<Food[]> { // Persistencia
    const ret = await Storage.get({ key: 'dinner' });
    return JSON.parse(ret.value) ? JSON.parse(ret.value) : [];
  }

  public async getFoodCounterFromStorage(): Promise<number> {
    const { value } = await Storage.get({ key: 'foodCounter' });
    return value ? +value : 0;
  }

  public getLunch(): Food[] {
    return this.lunch;
  }

  public getDinner(): Food[] {
    return this.dinner;
  }

  public async saveFood(f: Food, typeOfFood: string) {
    if (f.id == undefined) { // Comida nueva
      f.id = this.foodCounter++;
      if (typeOfFood == "breakfast") {
        this.breakfast.push(f);
      } else if (typeOfFood == "lunch") {
        this.lunch.push(f);
      } else {
        this.dinner.push(f);
      }
    } else { // Edición de una comida
      this.deleteFood(f.id);
      if (typeOfFood == "breakfast") {
        this.breakfast.push(f);
      } else if (typeOfFood == "lunch") {
        this.lunch.push(f);
      } else {
        this.dinner.push(f);
      }
    }

    await this.saveFoods(this.breakfast, this.lunch, this.dinner);
    await this.saveFoodCounter(this.foodCounter);

  }

  public async saveFoods(breakfast: Food[], lunch: Food[], dinner: Food[]) { // Persistencia
    await Storage.set({
      key: 'breakfast',
      value: JSON.stringify(breakfast)
    });

    await Storage.set({
      key: 'lunch',
      value: JSON.stringify(lunch)
    });

    await Storage.set({
      key: 'dinner',
      value: JSON.stringify(dinner)
    });
  }

  public async saveFoodCounter(fc: number) {
    await Storage.set({
      key: 'foodCounter',
      value: '' + fc
    });
  }

  public async deleteFood(id: number) {
    if (this.breakfast.find(f => f.id === id)) {
      this.breakfast = this.breakfast.filter(f => f.id != id);
    } else if (this.lunch.find(f => f.id === id)) {
      this.lunch = this.lunch.filter(f => f.id != id);
    } else {
      this.dinner = this.dinner.filter(f => f.id != id);
    }

    await this.saveFoods(this.breakfast, this.lunch, this.dinner);
  }
}
