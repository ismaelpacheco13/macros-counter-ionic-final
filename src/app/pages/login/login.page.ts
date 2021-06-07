import { Component,OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { auth } from 'firebase/app';
import { AuthenticationService } from "../../shared/authentication-service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  constructor(
    public authService: AuthenticationService,
    public router: Router
  ) {}

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    // if(this.authService.isLoggedIn) {
    //   this.router.navigate(['home']);
    // }
    auth().onAuthStateChanged(user => {
      if (user) {
        this.router.navigate(['home']);
      }
    })
  }

  logIn(email, password) {
    this.authService.SignIn(email.value, password.value)
      .then((res) => {
        if(this.authService.isEmailVerified) {
          this.router.navigate(['home']);          
        } else {
          window.alert('Email is not verified')
          return false;
        }
      }).catch((error) => {
        window.alert(error.message)
      })
  }

}
