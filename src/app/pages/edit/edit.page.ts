import { Component, OnInit } from '@angular/core';
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

  constructor(
    private foodsService: FoodsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id != null) {
      this.food = this.foodsService.getSingleFood(id);
    }
  }

  saveFood() {
    this.foodsService.saveFood(this.food);
    this.router.navigateByUrl('/');
  }

}
