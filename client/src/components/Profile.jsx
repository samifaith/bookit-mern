import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import axios from "axios";

function Profile() {
	const [books, setBooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [favorites, setFavorites] = useState([]);
	const { user, logout, refreshUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const loadData = async () => {
			if (refreshUser) {
				await refreshUser(); // Ensure we have the latest user data
			}
			if (user && user.favGenres) {
				console.log("User favGenres:", user.favGenres); // Debug log
				fetchBooks();
				fetchFavorites();
			} else {
				setLoading(false);
			}
		};
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchFavorites = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await axios.get(
				"http://localhost:7070/api/user/favorites",
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setFavorites(response.data.favoriteBooks || []);
		} catch (err) {
			console.log("Error fetching favorites:", err);
		}
	};

	const fetchBooks = async () => {
		try {
			// Remove duplicates from favGenres (case-insensitive)
			const favGenres = user.favGenres || [];
			const uniqueGenres = favGenres.filter(
				(genre, index, self) =>
					index ===
					self.findIndex((g) => g.toLowerCase() === genre.toLowerCase())
			);

			const cleanTopics = uniqueGenres.map((topic) =>
				topic.toLowerCase().replace(/-/g, "").replace(/\s+/g, "")
			);

			// Fetch books for ALL favorite genres
			const promises = cleanTopics.map((topic) =>
				fetch(
					`https://www.googleapis.com/books/v1/volumes?q=subject:${topic}&orderBy=relevance&maxResults=2`
				).then((res) => res.json())
			);

			const results = await Promise.all(promises);

			// Store books as an array of genre data
			const genreBooks = results.map((result, index) => ({
				genre: uniqueGenres[index],
				items: result?.items || [],
			}));

			setBooks(genreBooks);
			setLoading(false);
		} catch (err) {
			console.error("Error fetching books:", err);
			setLoading(false);
		}
	};

	const handleGenreCount = async (genreTitle) => {
		try {
			await api.put("/api/user/genre-count", { genreTitle });
		} catch (err) {
			console.error("Error updating genre count:", err);
		}
	};

	const handleAddToFavorites = async (book) => {
		const isbn = book.volumeInfo?.industryIdentifiers?.[0]?.identifier;
		if (!isbn) return;

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				alert("Please log in to add favorites");
				return;
			}

			const isFav = favorites.some((fav) => fav.isbn === isbn);

			if (isFav) {
				// Remove from favorites
				await axios.delete(`http://localhost:7070/api/user/favorites/${isbn}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setFavorites(favorites.filter((fav) => fav.isbn !== isbn));
			} else {
				// Add to favorites
				await axios.post(
					"http://localhost:7070/api/user/favorites",
					{
						isbn,
						title: book.volumeInfo.title,
						authors: book.volumeInfo.authors || [],
						imageLink:
							book.volumeInfo.imageLinks?.thumbnail ||
							book.volumeInfo.imageLinks?.smallThumbnail,
					},
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setFavorites([
					...favorites,
					{
						isbn,
						title: book.volumeInfo.title,
						authors: book.volumeInfo.authors,
						imageLink: book.volumeInfo.imageLinks?.thumbnail,
					},
				]);
			}
		} catch (err) {
			console.error("Error updating favorites:", err);
			alert(err.response?.data?.message || "Error updating favorites");
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	if (loading) return <div>Loading...</div>;
	if (!user) return <div>Please log in</div>;

	return (
		<div>
			<link rel="stylesheet" href="/normalize.css" />
			<link rel="stylesheet" href="/profile.css" />
			<link
				rel="stylesheet"
				href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css"
			/>
			<link
				href="https://fonts.googleapis.com/css?family=Lato:500,600,700,700i|Playfair+Display:500,600,700,700i|Playfair+Display+SC:500,600,700,700i&display=swap"
				rel="stylesheet"
			/>

			<header>
				<section id="logo">
					<Link to="/">
						<img src="/images/booksWhiote.png" alt="BookIt! Logo" />
					</Link>
				</section>
				<section id="dropdown">
					<label htmlFor="options-select">
						Made For You: <span id="books">Books</span>
					</label>
					<Link to="/interests">
						<input type="button" name="" value="INTERESTS" />
					</Link>
				</section>
			</header>

			<div className="hero">
				{books.map((genreData, genreIndex) => {
					const { genre, items } = genreData;
					if (!genre || !items || items.length === 0) return null;

					// Capitalize first letter of genre
					const displayGenre = genre.charAt(0).toUpperCase() + genre.slice(1);

					return (
						<section
							className="mainSec"
							id={`genre${genreIndex + 1}`}
							key={genreIndex}
						>
							<div className="topicDiv">
								<section className="topic">
									<h3>{displayGenre}</h3>
									<input
										id={`topic${genreIndex + 1}`}
										type="hidden"
										value={genre}
									/>
									<p id={`genreOverview${genreIndex + 1}`}></p>
								</section>
							</div>
							<div className="recommendDiv">
								{items.slice(0, 2).map((book, bookIndex) => {
									if (!book || !book.volumeInfo) return null;
									const info = book.volumeInfo;
									const isbn = info.industryIdentifiers?.[0]?.identifier || "";
									const isFavorited = favorites.some(
										(fav) => fav.isbn === isbn
									);

									return (
										<section className="recommend" key={bookIndex}>
											<Link
												to={`/bookpage?isbn=${isbn}`}
												onClick={() => handleGenreCount(genre)}
											>
												<img
													data-category={genre}
													src={
														info.imageLinks?.thumbnail ||
														info.imageLinks?.smallThumbnail ||
														"/images/StartupBook.svg"
													}
													alt="book"
													id={`imgBook${genreIndex * 2 + bookIndex + 1}`}
													className="genreCount"
													onError={(e) => {
														e.target.src = "/images/StartupBook.svg";
													}}
													style={{
														width: "128px",
														height: "auto",
														background: "white",
													}}
												/>
											</Link>
											<div className="bookInfo">
												<p
													className="title"
													id={`title${genreIndex * 2 + bookIndex + 1}`}
												>
													{info.title || ""}
												</p>
												<p
													className="author"
													id={`author${genreIndex * 2 + bookIndex + 1}`}
												>
													{info.authors?.join(", ") || "Unknown"}
												</p>
												<div
													className="fave"
													onClick={() => handleAddToFavorites(book)}
													style={{ cursor: "pointer" }}
												>
													<img
														className="faveIcon"
														src="/images/bookheart.png"
														alt="favorite book"
													/>
													<p>{isFavorited ? "Unfavorite" : "Favorite"}</p>
												</div>
											</div>
										</section>
									);
								})}
							</div>
							<div className="circleDiv">
								<section className="circle">
									<p></p>
								</section>
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}

export default Profile;
