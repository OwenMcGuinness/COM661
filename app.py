from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
from bson import ObjectId
from jwt.exceptions import ExpiredSignatureError
import datetime
from functools import wraps
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://127.0.0.1:27017")
db = client.moviesDB  
movies = db.movies  

@app.route("/api/v1.0/movies", methods=["GET"])
def show_all_movies():

    page_num, page_size = 8, 12
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))
  
    data_to_return = []
    for movie in movies.find().skip(page_start).limit(page_size):
        movie['_id'] = str(movie['_id'])
        movie['reviews'] = []
        data_to_return.append(movie)

    return make_response(jsonify(data_to_return), 200)


@app.route("/api/v1.0/movies/<string:id>", methods=["GET"])
def show_one_movie(id):
    movie = movies.find_one({'_id': ObjectId(id)})
    if movie is not None:
        movie['_id'] = str(movie['_id'])
        movie['reviews'] = []
        movie['reviews_count'] = int(movie['reviews_count'])

        return make_response(jsonify([movie]), 200)
    else:
        return make_response(jsonify({"error": "Invalid movie ID"}), 404)


@app.route("/api/v1.0/movies", methods=["POST"])
def add_movie():
    required_fields = ["title", "genres", "year", "director", "plot", "posterUrl"]
    
    if all(field in request.form for field in required_fields):
        new_movie = {
        "title": request.form["title"],
        "genres": request.form["genres"].split(','),        
        "year": request.form["year"],            
        "director": request.form["director"],
        "plot": request.form["plot"],
        "posterUrl": request.form["posterUrl"],
        "runtime": request.form["runtime"],
        "actors": request.form["actors"].split(','),
        "reviews": [],
        "reviews_count": 0,
        "stars": 0,
        
      }
        new_movie_id = movies.insert_one(new_movie)
        new_movie_link = "http://localhost:5000/api/v1.0/movies/" + str(new_movie_id.inserted_id)
        return make_response(jsonify({"url": new_movie_link}), 201)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)
    

@app.route("/api/v1.0/movies/<string:id>", methods=["PUT"])
def edit_movie(id):
    required_fields = ["title", "genres", "year", "director", "plot", "posterUrl"]
    if all(field in request.form for field in required_fields):
        result = movies.update_one(
            {"_id": ObjectId(id)},
            {
                "$set": {
                    "title": request.form["title"],
                    "genres": request.form["genres"].split(','),
                    "year": request.form["year"],            
                    "director": request.form["director"],
                    "plot": request.form["plot"],
                    "posterUrl": request.form["posterUrl"],
                    "runtime": request.form["runtime"],
                    "actors": request.form["actors"].split(','),
                }
            }
        )
        if result.matched_count == 1:
            edited_movie_link = "http://localhost:5000/api/v1.0/movies/" + id
            return make_response(jsonify({"url": edited_movie_link}), 200)
        else:
            return make_response(jsonify({"error": "Invalid movie ID"}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/movies/<string:id>", methods=["DELETE"])
def delete_movie(id):
    result = movies.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid movie ID"}), 404)
    

@app.route("/api/v1.0/movies/search", methods=["GET"])
def search_movies():
    query = request.args.get('query', '')

    search_results = []
    for movie in movies.find({
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"genres": {"$regex": query, "$options": "i"}},
            {"director": {"$regex": query, "$options": "i"}},
            {"actors": {"$regex": query, "$options": "i"}}
        ]
    }):
        movie['_id'] = str(movie['_id'])
        movie['reviews'] = []
        search_results.append(movie)

    return make_response(jsonify(search_results), 200)


    
@app.route("/api/v1.0/movies/<string:id>/reviews", methods=["POST"])
def add_new_review(id):
    new_review_id = ObjectId()

    print(f"Generated ObjectId for the new review: {new_review_id}")

    new_review = {
        "_id": new_review_id,
        "username": request.form["username"],
        "text": request.form["text"],
        "stars": int(request.form["stars"]),
        "date": datetime.datetime.now(),
    }

    movies.update_one({"_id": ObjectId(id)}, {"$push": {"reviews": new_review}})

    movie = movies.find_one({"_id": ObjectId(id)})
    reviews = movie.get("reviews", [])

    total_stars = sum(review["stars"] for review in reviews)
    average_stars = round(total_stars / max(1, len(reviews)), 1)

    movies.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"stars": average_stars, "reviews_count": len(reviews)}}
    )

    new_review_link = f"/api/v1.0/movies/{id}/reviews/{str(new_review['_id'])}"

    return make_response(jsonify({"url": new_review_link}), 201)



@app.route("/api/v1.0/movies/<string:id>/reviews", methods=["GET"])
def fetch_all_reviews(id):
    movie = movies.find_one({"_id": ObjectId(id)}, {"reviews": 1, "_id": 0})
    if movie is not None and "reviews" in movie:
        reviews = movie["reviews"]
        for review in reviews:
            review["_id"] = str(review["_id"])

        return make_response(jsonify(reviews), 200)
    else:
        return make_response(jsonify({"error": "Invalid movie ID or no reviews"}), 404)



@app.route("/api/v1.0/movies/<bid>/reviews/<rid>", methods=["GET"])
def fetch_one_review(bid, rid):
    movie = movies.find_one(
        {"reviews._id": ObjectId(rid)},
        {"_id": 0, "reviews.$": 1}
    )
    if movie is not None and "reviews" in movie:
        review = movie["reviews"][0]
        review["_id"] = str(review["_id"])
        return make_response(jsonify(review), 200)
    else:
        return make_response(jsonify({"error": "Invalid movie ID or review ID"}), 404)



@app.route("/api/v1.0/movies/<bid>/reviews/<rid>", methods=["PUT"])
def edit_review(bid, rid):
    required_fields = ["username", "text", "stars"]
    if all(field in request.form for field in required_fields):
        edited_review = {
            "reviews.$.username": request.form["username"],
            "reviews.$.text": request.form["text"],
            "reviews.$.stars": int(request.form['stars'])
        }
        movies.update_one(
            {"reviews._id": ObjectId(rid)},
            {"$set": edited_review}
        )

        movie = movies.find_one({"_id": ObjectId(bid)})
        reviews = movie.get("reviews", [])
        total_stars = sum(review["stars"] for review in reviews)
        average_stars = round(total_stars / max(1, len(reviews)), 1)

        movies.update_one(
            {"_id": ObjectId(bid)},
            {"$set": {"stars": average_stars, "reviews_count": len(reviews)}}
        )

        edit_review_url = "http://localhost:5000/api/v1.0/movies/" + bid + "/reviews/" + rid
        return make_response(jsonify({"url": edit_review_url}), 200)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


@app.route("/api/v1.0/movies/<bid>/reviews/<rid>", methods=["DELETE"])
def delete_review(bid, rid):
    result = movies.update_one(
        {"_id": ObjectId(bid)},
        {"$pull": {"reviews": {"_id": ObjectId(rid)}}}
    )

    movie = movies.find_one({"_id": ObjectId(bid)})
    reviews = movie.get("reviews", [])
    total_stars = sum(review["stars"] for review in reviews)
    average_stars = total_stars / max(1, len(reviews))

    movies.update_one({"_id": ObjectId(bid)}, {"$set": {"stars": average_stars}})

    movies.update_one({"_id": ObjectId(bid)}, {"$inc": {"reviews_count": -1}})

    if result.modified_count == 1:
        return make_response(jsonify({}), 204)
    else:
        return make_response(jsonify({"error": "Invalid movie ID or review ID"}), 404)
    

if __name__ == "__main__":
    app.run(debug=True)