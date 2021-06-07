import { Injectable } from '@angular/core';
import { Food } from '../model/food';

import { Plugins } from '@capacitor/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';

import { v4 as uuidv4 } from 'uuid';

const { Storage } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class FoodsService {

  breakfast: Food[] = [];
  lunch: Food[] = [];
  dinner: Food[] = [];
  foodCounter: number = 0;
  foodListRef: AngularFireList<any>;
  foodRef: AngularFireObject<any>;

  constructor(
    private db: AngularFireDatabase,
    public ngFireAuth: AngularFireAuth
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

    // this.getBreakFastFromStorage().then( // Persistencia
    //   data => this.breakfast = data
    // );

    // this.getLunchFromStorage().then( // Persistencia
    //   data => this.lunch = data
    // );

    // this.getDinnerFromStorage().then( // Persistencia
    //   data => this.dinner = data
    // );

    // this.getFoodCounterFromStorage().then( // Persistencia
    //   data => this.foodCounter = data
    // );

  }

  public getSingleFood(id: string): Food {
    if (this.breakfast.find(f => f.id === id)) {
      return this.breakfast.filter(f => f.id === id)[0];
    } else if (this.lunch.find(f => f.id === id)) {
      return this.lunch.filter(f => f.id === id)[0];
    } else {
      return this.dinner.filter(f => f.id === id)[0];
    }
  }

  public getTypeOfFood(id: string): string {
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

  // public async getBreakFastFromStorage(): Promise<Food[]> { // Persistencia
  //   const ret = await Storage.get({ key: 'breakfast' });
  //   return JSON.parse(ret.value) ? JSON.parse(ret.value) : [];
  // }

  // public async getLunchFromStorage(): Promise<Food[]> { // Persistencia
  //   const ret = await Storage.get({ key: 'lunch' });
  //   return JSON.parse(ret.value) ? JSON.parse(ret.value) : [];
  // }

  // public async getDinnerFromStorage(): Promise<Food[]> { // Persistencia
  //   const ret = await Storage.get({ key: 'dinner' });
  //   return JSON.parse(ret.value) ? JSON.parse(ret.value) : [];
  // }

  // public async getFoodCounterFromStorage(): Promise<number> {
  //   const { value } = await Storage.get({ key: 'foodCounter' });
  //   return value ? +value : 0;
  // }

  public getLunch(): Food[] {
    return this.lunch;
  }

  public getDinner(): Food[] {
    return this.dinner;
  }

  public async saveFood(f: Food, date: string) {
    if (f.id == undefined) { // Comida nueva
      f.id = uuidv4();
      f.date = date;
      // if (f.typeOfFood != undefined) {
      //   if (f.typeOfFood == "breakfast") {
      //     this.breakfast.push(f);
      //   } else if (f.typeOfFood == "lunch") {
      //     this.lunch.push(f);
      //   } else {
      //     this.dinner.push(f);
      //   }
      // }
      
    } else { // Edición de una comida
      this.deleteFood(f.id);
      this.deleteRealtimeFood(f);
      // if (f.typeOfFood != undefined) {
      //   if (f.typeOfFood == "breakfast") {
      //     this.breakfast.push(f);
      //   } else if (f.typeOfFood == "lunch") {
      //     this.lunch.push(f);
      //   } else {
      //     this.dinner.push(f);
      //   }
      // }
    }

    // await this.saveFoods(this.breakfast, this.lunch, this.dinner);
    // await this.saveFoodCounter(this.foodCounter);
    await this.createRealtimeFood(f);

  }

  // public async saveFoods(breakfast: Food[], lunch: Food[], dinner: Food[]) { // Persistencia
  //   await Storage.set({
  //     key: 'breakfast',
  //     value: JSON.stringify(breakfast)
  //   });

  //   await Storage.set({
  //     key: 'lunch',
  //     value: JSON.stringify(lunch)
  //   });

  //   await Storage.set({
  //     key: 'dinner',
  //     value: JSON.stringify(dinner)
  //   });
  // }

  // public async saveFoodCounter(fc: number) {
  //   await Storage.set({
  //     key: 'foodCounter',
  //     value: '' + fc
  //   });
  // }

  public async deleteFood(id: string) {
    if (this.breakfast.find(f => f.id === id)) {
      this.breakfast = this.breakfast.filter(f => f.id != id);
    } else if (this.lunch.find(f => f.id === id)) {
      this.lunch = this.lunch.filter(f => f.id != id);
    } else {
      this.dinner = this.dinner.filter(f => f.id != id);
    }

    // await this.saveFoods(this.breakfast, this.lunch, this.dinner);
  }

  // Realtime Database (Firebase)
  public createRealtimeFood(f: Food) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    this.foodListRef = this.db.list(`/${uid}/food/${f.date}/${f.typeOfFood}/`);
    return this.foodListRef.set(f.id, f);
  }

  public deleteRealtimeFood(f: Food) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    this.foodRef = this.db.object(`/${uid}/food/${f.date}/${f.typeOfFood}/${f.id}`);
    return this.foodRef.remove();
  }

  public getRealtimeFoodBreakfastList() {
    this.breakfast = [];
    let uid = this.ngFireAuth.auth.currentUser.uid;
    let date = localStorage.getItem('date');
    this.foodListRef = this.db.list(`/${uid}/food/${date}/breakfast/`);
    return this.foodListRef.valueChanges().subscribe(res => {
      res.forEach(item => {
        this.breakfast.push(item);
      })
    })
  }

  public getRealtimeFoodLunchList() {
    this.lunch = [];
    let uid = this.ngFireAuth.auth.currentUser.uid;
    let date = localStorage.getItem('date');
    this.foodListRef = this.db.list(`/${uid}/food/${date}/lunch/`);
    return this.foodListRef.valueChanges().subscribe(res => {
      res.forEach(item => {
        this.lunch.push(item);
      })
    })
  }

  public getRealtimeFoodDinnerList() {
    this.dinner = [];
    let uid = this.ngFireAuth.auth.currentUser.uid;
    let date = localStorage.getItem('date');
    this.foodListRef = this.db.list(`/${uid}/food/${date}/dinner/`);
    return this.foodListRef.valueChanges().subscribe(res => {
      res.forEach(item => {
        this.dinner.push(item);
      })
    })
  }

}
