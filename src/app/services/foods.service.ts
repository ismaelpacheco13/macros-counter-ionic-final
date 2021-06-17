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
  favourite: Food[] = [];
  foodListRef: AngularFireList<any>;
  foodRef: AngularFireObject<any>;

  constructor(
    private db: AngularFireDatabase,
    public ngFireAuth: AngularFireAuth
  ) {

  }

  // public async getSingleFood(id: string): Promise<Food> {
  //   let uid = this.ngFireAuth.auth.currentUser.uid;
  //   let food: Food;
  //   await this.db.database.ref().child(`/${uid}/favourite/food/${id}/`)
  //     .once('value')
  //     .then(snapshot => {
  //       food = snapshot.val();
  //     });
  //   return food;
  // }

  public getBreakfast(): Food[] {
    return this.breakfast;
  }

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

    } else { // Edición de una comida
      f.date = date;
      this.deleteRealtimeFood(f);
    }

    await this.createRealtimeFood(f);
    await this.createRealtimeFavouriteFood(f);

  }

  // public async deleteFood(id: string) {
  //   if (this.breakfast.find(f => f.id === id)) {
  //     this.breakfast = this.breakfast.filter(f => f.id != id);
  //   } else if (this.lunch.find(f => f.id === id)) {
  //     this.lunch = this.lunch.filter(f => f.id != id);
  //   } else {
  //     this.dinner = this.dinner.filter(f => f.id != id);
  //   }
  // }

  // Realtime Database (Firebase)
  public createRealtimeFood(f: Food) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    f.deletedFromFavourites = false;
    this.foodListRef = this.db.list(`/${uid}/food/${f.date}/${f.typeOfFood}/`);
    return this.foodListRef.set(f.id, f);
  }

  public createRealtimeFavouriteFood(f: Food) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    this.foodListRef = this.db.list(`/${uid}/favourite/food/`);
    return this.foodListRef.set(f.id, f);
  }

  public deleteRealtimeFood(f: Food) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    this.foodRef = this.db.object(`/${uid}/food/${f.date}/${f.typeOfFood}/${f.id}`);
    return this.foodRef.remove();
  }

  public deleteRealtimeFavouriteFood(f: Food) { // Al borrar de favoritos se actualiza el booleano deletedFromFavourites a true
    let uid = this.ngFireAuth.auth.currentUser.uid;
    f.deletedFromFavourites = true;
    this.foodListRef = this.db.list(`/${uid}/favourite/food/`);
    return this.foodListRef.set(f.id, f);
  }

  public deleteRealtimeFavouriteFoodList(uid: string) { // Método solo para administradores
    this.foodListRef = this.db.list(`/${uid}/favourite/food/`);
    return this.foodListRef.remove();
  }

  public async getRealtimeFoodBreakfastList(breakfast: Food[]) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    let date = localStorage.getItem('date');
    await this.db.database.ref().child(`/${uid}/food/${date}/breakfast/`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(item => {
          breakfast.push(item.val());
        })
      });
    this.breakfast = breakfast;
  }

  public async getRealtimeFoodLunchList(lunch: Food[]) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    let date = localStorage.getItem('date');
    await this.db.database.ref().child(`/${uid}/food/${date}/lunch/`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(item => {
          lunch.push(item.val());
        })
      });
    this.lunch = lunch;
  }

  public async getRealtimeFoodDinnerList(dinner: Food[]) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    let date = localStorage.getItem('date');
    await this.db.database.ref().child(`/${uid}/food/${date}/dinner/`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(item => {
          dinner.push(item.val());
        })
      });
    this.dinner = dinner;
  }

  public async getRealtimeFavouriteFoodList(favourite: Food[]) {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    await this.db.database.ref().child(`/${uid}/favourite/food/`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(item => {
          if (item.val().deletedFromFavourites != true) {
            favourite.push(item.val());
          }
        })
      });
  }

}
