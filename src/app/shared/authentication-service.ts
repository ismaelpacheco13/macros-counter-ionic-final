import { Injectable, NgZone } from '@angular/core';
import { auth } from 'firebase/app';
import { User } from "./user";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userData: any;
  userListRef: AngularFireList<any>;
  userRef: AngularFireObject<any>;

  admins: String[];

  constructor(
    public afStore: AngularFirestore,
    private db: AngularFireDatabase,
    public ngFireAuth: AngularFireAuth,
    public router: Router,  
    public ngZone: NgZone
  ) {
    GoogleAuth.init();

    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  // Login in with email/password
  SignIn(email, password) {
    return this.ngFireAuth.auth.signInWithEmailAndPassword(email, password)
  }

  // Register user with email/password
  RegisterUser(email, password) {
    return this.ngFireAuth.auth.createUserWithEmailAndPassword(email, password)
  }

  // Email verification when new user register
  SendVerificationMail() {
    return this.ngFireAuth.auth.currentUser.sendEmailVerification()
    .then(() => {
      this.router.navigate(['verify-email']);
    })
  }

  // Recover password
  PasswordRecover(passwordResetEmail) {
    return this.ngFireAuth.auth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email has been sent, please check your inbox.');
    }).catch((error) => {
      window.alert(error)
    })
  }

  // Returns true when user is looged in
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  // Returns true when user's email is verified
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user.emailVerified !== false) ? true : false;
  }

  // Sign in with Gmail
  GoogleAuth() {
    // return this.AuthLogin(new auth.GoogleAuthProvider());
    return this.googleSignIn();
  }

  async googleSignIn() {
    let googleUser = await GoogleAuth.signIn();
    const credential = auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
    return this.ngFireAuth.auth.signInAndRetrieveDataWithCredential(credential);
  }

  // Sign in with Twitter
  TwitterAuth() {
    return this.AuthLogin(new auth.TwitterAuthProvider());
  }

  // Sign in with Facebook
  FacebookAuth() {
    return this.AuthLogin(new auth.FacebookAuthProvider());
  }

  // Auth providers
  AuthLogin(provider) {
    return this.ngFireAuth.auth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['home']);
        })
      this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error)
    })
  }

  getUid() {
    let uid = this.ngFireAuth.auth.currentUser.uid;
    return uid;
  }

  // Store user in localStorage
  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    return userRef.set(userData, {
      merge: true
    })
  }

  // Sign-out 
  SignOut() {
    return this.ngFireAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    })
  }

  // Create user in Realtime Database (Se ejecuta cada vez que el usuario llega al homepage al iniciar sesión (para actualizar la ultima conexión))
  public async createRealtimeUser(user) {
    await this.getRealtimeAdminList();
    let userParsed = JSON.parse(JSON.stringify(user));
    this.userListRef = this.db.list(`/admin/users/`);
    let date = new Date(Number(userParsed.lastLoginAt));
    userParsed.lastLoginString = date.toLocaleString('es-ES', {timeZone: 'Europe/Madrid'}); // Para tener la última conexión del usuario como un String con hora local
    if (this.admins.includes(userParsed.uid)) {
      userParsed.isAdmin = true;
    } else {
      userParsed.isAdmin = false;
    }
    return this.userListRef.set(user.uid, userParsed);
  }

  public async getRealtimeAdminList(): Promise<String[]> { // Busca la lista de admins de la aplicación en Realtime Database
    this.admins = [];
    await this.db.database.ref().child(`/admin/list`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(item => {
          this.admins.push(item.val());
        })
      });
    return this.admins;
  }

  public setRealtimeAdmin(uid: string) {
    this.userListRef = this.db.list(`/admin/list/`);
    return this.userListRef.set(uid, uid);
  }

  public deleteRealtimeAdmin(uid: string) {
    this.userRef = this.db.object(`/admin/list/${uid}`);
    return this.userRef.remove();
  }

}