import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Food } from 'src/app/model/food';
import { FoodsService } from 'src/app/services/foods.service';

@Component({
  selector: 'app-favourite',
  templateUrl: './favourite.page.html',
  styleUrls: ['./favourite.page.scss'],
})
export class FavouritePage implements OnInit {

  favourite: Food[] = [];

  constructor(
    private foodsService: FoodsService,
    private alertController: AlertController,
    private router: Router,
    public ngFireAuth: AngularFireAuth
  ) { }

  ngOnInit() {
    this.ngFireAuth.authState.subscribe(user => { // Espera a que cargue el uid antes de cargar las comidas
      if (user) {
        this.getFavourite();
      }
    })
  }

  async goEditFood(id: string) {
    await this.router.navigateByUrl(`/edit${id != undefined ? '/' + id : ''}`);
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
          text: 'Añadir',
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
      message: `¿Estás seguro que quieres borrar la comida <strong>${f.name}</strong> de tus favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Aceptar',
          handler: () => {
            this.getFavourite();
            this.foodsService.deleteRealtimeFavouriteFood(f);
          }
        }
      ]
    });

    await alert.present();
  }

  async getFavourite() {
    this.favourite = [];
    await this.foodsService.getRealtimeFavouriteFoodList(this.favourite);
  }

}
