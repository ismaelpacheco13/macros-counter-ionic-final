import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Food } from 'src/app/model/food';
import { FoodsService } from 'src/app/services/foods.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  food: Food = {name: '', kcal: 0, grml: 0, protein: 0, carbs: 0, fats: 0, typeOfFood: 'breakfast'}
  date: string;

  constructor(
    private foodsService: FoodsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public ngFireAuth: AngularFireAuth
  ) { }

  ngOnInit() {

    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.getFood();
      }
    })

    this.date = localStorage.getItem('date');
  }

  saveFood() {
    this.foodsService.saveFood(this.food, this.date);
    this.router.navigate(['home']);
  }

  async getFood() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id != null) {
      this.food = JSON.parse(localStorage.getItem('food'));
      console.log(this.food);
    }
  }

}
