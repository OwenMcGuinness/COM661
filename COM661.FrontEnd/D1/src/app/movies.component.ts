import { Component, OnInit, Renderer2 } from '@angular/core';
import { WebService } from './web.service';
import { AuthService } from '@auth0/auth0-angular';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
})
export class MoviesComponent implements OnInit {
  movie_list: any[] = [];
  page: number = 1;
  totalPages: number[] = [];
  isLastPage: boolean = false;
  searchTerm: string = '';
  newMovie: any = {
    title: '',
    genres: '',
    director: '',
    plot: '',
    posterUrl: '',
    runtime: '',
    actors: '',
  };

  constructor(
    public webService: WebService, 
    public authService: AuthService,
    private renderer: Renderer2
    ) {}

  ngOnInit() {
    if (sessionStorage['page']) {
      this.page = Number(sessionStorage['page']);
    }
    this.loadMovies();
    this.calculateTotalPages();
  }


  loadMovies() {
    this.webService.getMovies(this.page).subscribe(
      (movies) => {
        this.movie_list = movies;
        this.calculateTotalPages(); 
      },
      (error) => {
        console.error('Error loading movies:', error);
        if (error instanceof HttpErrorResponse) {
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Response body:', error.error);
        }
      }
    );
  }


  calculateTotalPages() {

    const totalMovies = 95; 
    const moviesPerPage = 12; 
  
    this.totalPages = Array.from({ length: Math.ceil(totalMovies / moviesPerPage) }, (_, i) => i + 1);
    this.isLastPage = this.page === this.totalPages.length;
  }

  // calculateTotalPages() {
  //   const totalMovies = this.movie_list.length;
  //   const moviesPerPage = 16;

  //   this.totalPages = Array.from({ length: Math.ceil(totalMovies / moviesPerPage) }, (_, i) => i + 1);
  //   this.isLastPage = this.page === this.totalPages.length;
  // }


  goToPage(pageNum: number) {
    this.page = pageNum;
    sessionStorage['page'] = this.page;
    this.loadMovies();
    this.calculateTotalPages();
  }

  previousPage() {
    if (this.page > 1) {
      this.page = this.page - 1;
      sessionStorage['page'] = this.page;
      this.loadMovies();
      this.calculateTotalPages();
    }
  }


  nextPage() {
    this.page = this.page + 1;
    sessionStorage['page'] = this.page;
    this.loadMovies();
    this.calculateTotalPages();
  }


  searchMovies() {
    this.webService.searchMovies(this.searchTerm).subscribe((movies) => {
      this.movie_list = movies;
    });
  }


  openAddMovieModal() {
    const modal = document.getElementById('addMovieModal');
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
  }
  
  closeAddMovieModal() {
    const modal = document.getElementById('addMovieModal');
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
  }


  addMovie() {
    if (this.newMovie.genres && !Array.isArray(this.newMovie.genres)) {
      this.newMovie.genres = [this.newMovie.genres];
    }

    this.webService.addMovie(this.newMovie).subscribe(
      (response: any) => {
        console.log(response);

        this.newMovie = {
          title: '',
          genres: '',
          year: '',
          director: '',
          plot: '',
          posterUrl: '',
          runtime: '',
          actors: '',
        };
      },
      (error) => {
        console.error('Error adding movie:', error);
        if (error instanceof HttpErrorResponse) {
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Response body:', error.error);
        }
      }
    );
  }
}
