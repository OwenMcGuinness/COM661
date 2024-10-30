import { WebService } from './web.service';
import { ActivatedRoute, Router } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { Component, Renderer2 } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})

export class MovieComponent {

  movie_list: any = [];
  reviews: any = [];
  reviewForm: any;
  editForm: any;
  editMovieForm: any;
  editingReview: boolean = false;
  reviewIdToEdit: any;
  movieId: any;
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
    private route: ActivatedRoute,
    private router: Router, 
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {

    this.movie_list = this.webService.getMovie(this.route.snapshot.params['_id']);
    this.reviews = this.webService.getReviews(this.route.snapshot.params['_id']);
    this.movieId = this.route.snapshot.params['_id'];

    this.reviewForm = this.formBuilder.group({
      username: ['', Validators.required],
      review: ['', Validators.required],
      stars: 5
    });

    this.editForm = this.formBuilder.group({
      username: ['', Validators.required],
      review: ['', Validators.required],
      stars: 5
    });

    this.editMovieForm = this.formBuilder.group({
      title: ['', Validators.required],
      genres: ['', Validators.required],
      runtime: ['', Validators.required],
      year: ['', Validators.required],
      actors: ['', Validators.required],
      director: ['', Validators.required],
      plot: ['', Validators.required],
      posterUrl: ['', Validators.required],
    });
    
  }

  onSubmit() {
    try {
      this.webService.postReview(this.reviewForm.value)
        .subscribe((response: any) => {
          this.reviewForm.reset();
          this.reviews = this.webService.getReviews(this.movieId);
        });
  
    } catch (error) {
      console.error('Error while submitting review:', error);
    }
  }

  onEdit() {
    this.webService.editReview(this.movieId, this.reviewIdToEdit, this.editForm.value)
      .subscribe(
        (response: any) => {
          this.editForm.reset();
          this.reviews = this.webService.getReviews(this.movieId);
        },
        (error) => {
          console.error('Error editing review:', error);
          if (error instanceof HttpErrorResponse) {
            console.error('Status:', error.status);
            console.error('Message:', error.message);
            console.error('Response body:', error.error);
          }
        }
      );
  }

  isInvalid(control: any) {
    return this.reviewForm.controls[control].invalid &&
      this.reviewForm.controls[control].touched;
  }

  isUntouched() {
    return this.reviewForm.controls.username.pristine ||
      this.reviewForm.controls.review.pristine;
  }

  isIncomplete() {
    return this.isInvalid('username') ||
      this.isInvalid('review') ||
      this.isUntouched();
  }

  showEditForm(event: any, review: any) {
    this.editingReview = true;
    this.reviewIdToEdit = review._id;
  
    this.editForm.patchValue({
        username: review.username,
        review: review.text,
        stars: review.stars
    });

    const modal = document.getElementById('editModal');
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
  }

  hideEditForm() {
    const modal = document.getElementById('editModal');
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
  }

  showReviewForm() {
    const modal = document.getElementById('reviewModal');
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
  }
  
  hideReviewForm() {
    const modal = document.getElementById('reviewModal');
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
  }

  showEditMovieForm() {
    const modal = document.getElementById('editMovieModal');
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
  }

  hideEditMovieForm() {
    const modal = document.getElementById('editMovieModal');
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
  }

  cancelEdit() {
    this.editingReview = false;
    this.reviewIdToEdit = null;
    this.editForm.reset();
  }

  isEditing(reviewId: any) {
    return this.editingReview && this.reviewIdToEdit === reviewId;
  }

  editReview(reviewId: any, review: any) {
    this.editingReview = true;
    this.reviewIdToEdit = reviewId;
  
    try {
      this.editForm.patchValue({
        username: review.username,
        review: review.text,
        stars: review.stars
      });

    } catch (error) {
      console.error('Error while editing review:', error);
    }
  }

  deleteReview(reviewId: any) {
    this.webService.deleteReview(this.movieId, reviewId).subscribe(
      (response: any) => {
        this.reviews = this.webService.getReviews(this.movieId);
      },
      (error) => {
        console.error('Error deleting review:', error);
        if (error instanceof HttpErrorResponse) {
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Response body:', error.error);
        }
      }
    );
  }

  editMovie() {
    this.webService.editMovie(this.movieId, this.newMovie).subscribe(
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
        console.error('Error editing movie:', error);
        if (error instanceof HttpErrorResponse) {
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Response body:', error.error);
        }
      }
    );
  }

  deleteMovie() {
    this.webService.deleteMovie(this.movieId).subscribe(
      (response: any) => {
        console.log(response);
        this.router.navigate(['/movies']);
      },
      (error) => {
        console.error('Error deleting movie:', error);
        if (error instanceof HttpErrorResponse) {
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Response body:', error.error);
        }
      }
    );
  }
}