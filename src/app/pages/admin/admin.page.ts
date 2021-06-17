import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AlertController } from '@ionic/angular';
import { FoodsService } from 'src/app/services/foods.service';
import { SettingsService } from 'src/app/services/settings.service';
import { AuthenticationService } from 'src/app/shared/authentication-service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  foodListRef: AngularFireList<any>;
  users: any[] = [];

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthenticationService,
    public foodsService: FoodsService,
    public settingsService: SettingsService,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    await this.getRealtimeUserList();
    console.log(this.users);
  }

  public async getRealtimeUserList() {
    this.users = [];
    await this.db.database.ref().child(`/admin/users/`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(item => {
          this.users.push(item.val());
        })
      });
  }

  async presentAlertPromote(user) {
    const alert = await this.alertController.create({
      header: ``,
      message: `¿Estás seguro de que deseas ascender a <strong>${user.email}</strong> a <strong>administrador</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Ascender',
          handler: async () => {
            this.authService.setRealtimeAdmin(user.uid);
            await this.authService.createRealtimeUser(user);
            await this.getRealtimeUserList();
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertDemote(user) {
    const alert = await this.alertController.create({
      header: ``,
      message: `¿Estás seguro de que deseas descender a <strong>${user.email}</strong> a <strong>usuario</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Descender',
          handler: async () => {
            this.authService.deleteRealtimeAdmin(user.uid);
            await this.authService.createRealtimeUser(user);
            await this.getRealtimeUserList();
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlert(user) {
    const alert = await this.alertController.create({
      header: `Detalles de usuario`,
      message: `UID: <strong>${user.uid}</strong>` + 
               `<br>Email: <strong>${user.email}</strong>` +
               `<br>Último logeo: <strong>${user.lastLoginString}</strong>`
    });

    await alert.present();
  }

  async presentAlertUserActions(user) {
    const alert = await this.alertController.create({
      header: `Acciones de administración de usuario`,
      message: `UID: <strong>${user.uid}</strong>` + 
               `<br>Email: <strong>${user.email}</strong>`,
      buttons: [
        {
          text: 'Eliminar configuración',
          handler: async () => {
            await this.settingsService.deleteRealtimeSettingsList(user.uid);
          }
        }, {
          text: 'Eliminar comidas favoritas',
          handler: async () => {
            await this.foodsService.deleteRealtimeFavouriteFoodList(user.uid);
          }
        }
      ]
    });

    await alert.present();
  }

}
