import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from '@auth0/auth0-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MoviesComponent } from './movies.component';
import { WebService } from './web.service';
import { HomeComponent } from './home.component';
import { MovieComponent } from './movie.component';
import { NavComponent } from './nav.component';

var routes: any = [
  { 
    path: '', 
    component: HomeComponent
  },
  { 
    path: 'movies', 
    component: MoviesComponent
  },
  {
    path: 'movies/:_id',
    component: MovieComponent
  },
];

@NgModule({
  declarations: [
    AppComponent, MoviesComponent, HomeComponent, MovieComponent, NavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    HttpClientModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    FormsModule, // Add FormsModule to the imports array
    AuthModule.forRoot( {
      domain:'dev-35zhs8ssx6bsftk7.us.auth0.com',
      clientId: 'cV3B3Hk13GZSpN6tISx7q9LeSYvtQjmI',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })
  ],
  providers: [WebService],
  bootstrap: [AppComponent]
})
export class AppModule { }