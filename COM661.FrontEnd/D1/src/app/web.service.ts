import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';


@Injectable()
export class WebService {

    private movieID: any;

    constructor(private http: HttpClient) { }

    movie_list: any;

    getMovies(page: number): Observable<any> {
        return this.http.get('http://localhost:5000/api/v1.0/movies?pn=' + page);
    }


    getMovie(id : any): Observable<any> {
        this.movieID = id;
        return this.http.get('http://localhost:5000/api/v1.0/movies/' + id);
    }


    getReviews(id : any): Observable<any> {
        return this.http.get('http://localhost:5000/api/v1.0/movies/' + id + '/reviews');
    }
    

    postReview(review: any): Observable<any> {
        let postData = new FormData();

        postData.append("username", review.username);
        postData.append("text", review.review);
        postData.append("stars", review.stars);

        let today = new Date();
        let todayDate = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
        postData.append("date", todayDate);

        return this.http.post('http://localhost:5000/api/v1.0/movies/' + this.movieID + '/reviews', postData);
    }


    editReview(movieId: any, reviewId: any, updatedReview: any): Observable<any> {

        let postData = new FormData();

        postData.append("username", updatedReview.username);
        postData.append("text", updatedReview.review);
        postData.append("stars", updatedReview.stars);

        let today = new Date();
        let todayDate = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
        postData.append("date", todayDate);

        return this.http.put(`http://localhost:5000/api/v1.0/movies/${movieId}/reviews/${reviewId}`, postData);
    }

    
    deleteReview(movieId: any, reviewId: any): Observable<any> {
        return this.http.delete(`http://localhost:5000/api/v1.0/movies/${movieId}/reviews/${reviewId}`);
    }


    addMovie(movie: any): Observable<any> {

      let formData = new FormData();
      formData.append("title", movie.title);
      formData.append("genres", movie.genres.join(', '));
      formData.append("year", movie.year);
      formData.append("director", movie.director);
      formData.append("plot", movie.plot);
      formData.append("posterUrl", movie.posterUrl);
      formData.append("runtime", movie.runtime);
      formData.append("actors", movie.actors);
  
      return this.http.post('http://localhost:5000/api/v1.0/movies', formData);
    }


    editMovie(movieId: any, updatedMovie: any): Observable<any> {

        let formData = new FormData();
        formData.append("title", updatedMovie.title);
        formData.append("genres", updatedMovie.genres);
        formData.append("year", updatedMovie.year);
        formData.append("director", updatedMovie.director);
        formData.append("plot", updatedMovie.plot);
        formData.append("posterUrl", updatedMovie.posterUrl);
        formData.append("runtime", updatedMovie.runtime);
        formData.append("actors", updatedMovie.actors);

        return this.http.put(`http://localhost:5000/api/v1.0/movies/${movieId}`, formData);
    }


    deleteMovie(movieId: any): Observable<any> {
        return this.http.delete(`http://localhost:5000/api/v1.0/movies/${movieId}`);
    }


    searchMovies(query: string): Observable<any> {
        const params = new HttpParams().set('query', query || '');

        return this.http.get('http://localhost:5000/api/v1.0/movies/search', { params });
    }

    
}
