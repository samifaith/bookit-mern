import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loading from "./Loading";
import Bookshelf from "./Bookshelf";
import { Button, Chip, SearchInput } from "./ui";
import "./Profile.css";

// Common/popular genres for instant suggestions (no API call needed)
const COMMON_GENRES = [
	"Romance",
	"Mystery",
	"Fantasy",
	"Science Fiction",
	"Thriller",
	"Young Adult",
	"Non-Fiction",
	"Fiction",
	"Self-Help",
	"Horror",
	"Biography",
	"History",
	"Poetry",
	"Adventure",
	"Crime",
	"Drama",
	"Comedy",
	"Graphic Novels",
	"Classics",
	"Dystopian",
	"Contemporary",
	"Paranormal",
	"Historical Fiction",
	"Memoir",
	"True Crime",
	"Philosophy",
	"Religion",
	"Cookbooks",
	"Travel",
	"Art",
	"Science",
	"Business",
];

function Profile() {
	const [genres, setGenres] = useState({
		Romance: false,
		Mystery: false,
		Fantasy: false,
		"Science-Fiction": false,
		Thriller: false,
		Juvenile: false,
		NonFiction: false,
		Fiction: false,
		"Self-Help": false,
	});
	const [favorites, setFavorites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchInput, setSearchInput] = useState("");
	const [genreSuggestions, setGenreSuggestions] = useState([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	// Book search states
	const [bookSearchInput, setBookSearchInput] = useState("");
	const [bookSearchResults, setBookSearchResults] = useState([]);
	const [showBookResults, setShowBookResults] = useState(false);

	const { user, refreshUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user && user.genres) {
			setGenres(user.genres);
		}
		fetchFavorites();
		setLoading(false);
	}, [user]);

	// Optimized genre suggestions with caching and local-first approach
	useEffect(() => {
		const fetchGenreSuggestions = async () => {
			if (!searchInput || searchInput.length < 2) {
				setGenreSuggestions([]);
				setShowDropdown(false);
				return;
			}

			// Helper function to check if genre already exists (case-insensitive)
			const genreExists = (genreToCheck) => {
				return Object.keys(genres).some(
					(existingGenre) =>
						existingGenre.toLowerCase() === genreToCheck.toLowerCase()
				);
			};

			// First, check local common genres (instant, no API call)
			const localMatches = COMMON_GENRES.filter(
				(genre) =>
					genre.toLowerCase().includes(searchInput.toLowerCase()) &&
					!genreExists(genre)
			);

			// Show local matches immediately
			if (localMatches.length > 0) {
				setGenreSuggestions(localMatches.slice(0, 8));
				setShowDropdown(true);
				setIsSearching(false);
			} else {
				// Only hit API if no local matches found
				setIsSearching(true);
				try {
					const response = await fetch(
						`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
							searchInput
						)}&maxResults=20`
					);
					const data = await response.json();

					if (data.items) {
						const categoriesSet = new Set();
						data.items.forEach((item) => {
							if (item.volumeInfo.categories) {
								item.volumeInfo.categories.forEach((category) => {
									category.split("/").forEach((cat) => {
										const trimmedCat = cat.trim();
										if (
											trimmedCat &&
											trimmedCat
												.toLowerCase()
												.includes(searchInput.toLowerCase()) &&
											!genreExists(trimmedCat)
										) {
											categoriesSet.add(trimmedCat);
										}
									});
								});
							}
						});

						// Only add search term if no categories found and it doesn't exist
						const searchTerm =
							searchInput.charAt(0).toUpperCase() + searchInput.slice(1);
						if (categoriesSet.size === 0 && !genreExists(searchTerm)) {
							categoriesSet.add(searchTerm);
						}

						const suggestions = Array.from(categoriesSet).slice(0, 8);
						setGenreSuggestions(suggestions);
						setShowDropdown(true);
						setIsSearching(false);
					} else {
						// No results from API - show "no genre found"
						setGenreSuggestions([]);
						setShowDropdown(true);
						setIsSearching(false);
					}
				} catch (err) {
					console.error("Error fetching genre suggestions:", err);
					// On error, show "no genre found"
					setGenreSuggestions([]);
					setShowDropdown(true);
					setIsSearching(false);
				}
			}
		};

		// Debounce: wait 500ms after user stops typing
		const debounceTimer = setTimeout(fetchGenreSuggestions, 500);
		return () => clearTimeout(debounceTimer);
	}, [searchInput, genres]);

	const fetchFavorites = async () => {
		try {
			const response = await api.get("/api/user/favorites");
			setFavorites(response.data.favoriteBooks || []);
		} catch (err) {
			console.error("Error fetching favorites:", err);
		}
	};

	const handleRemoveFavorite = async (isbn) => {
		try {
			await api.delete(`/api/user/favorites/${isbn}`);
			setFavorites(favorites.filter((book) => book.isbn !== isbn));
		} catch (err) {
			console.error("Error removing favorite:", err);
			alert("Failed to remove book from favorites");
		}
	};

	// Book search functionality
	const searchBooks = async (query) => {
		if (!query || query.length < 2) {
			setBookSearchResults([]);
			setShowBookResults(false);
			return;
		}

		try {
			const response = await fetch(
				`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
					query
				)}&maxResults=10`
			);
			const data = await response.json();

			if (data.items) {
				const books = data.items.map((item) => ({
					isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || item.id,
					title: item.volumeInfo.title,
					authors: item.volumeInfo.authors || ["Unknown Author"],
					imageLink:
						item.volumeInfo.imageLinks?.thumbnail || "/images/StartupBook.svg",
					categories: item.volumeInfo.categories || [],
				}));
				setBookSearchResults(books);
				setShowBookResults(true);
			}
		} catch (err) {
			console.error("Error searching books:", err);
		}
	};

	const handleAddBook = async (book) => {
		try {
			// Check if already in favorites
			if (favorites.some((fav) => fav.isbn === book.isbn)) {
				alert("This book is already in your favorites!");
				return;
			}

			await api.post("/api/user/favorites", {
				isbn: book.isbn,
				title: book.title,
				authors: book.authors,
				imageLink: book.imageLink,
				categories: book.categories,
			});

			setFavorites([...favorites, book]);
			setBookSearchInput("");
			setBookSearchResults([]);
			setShowBookResults(false);
			alert(`"${book.title}" added to your favorites!`);
		} catch (err) {
			console.error("Error adding book:", err);
			alert("Failed to add book. Please try again.");
		}
	};

	const handleCheckbox = (genre) => {
		setGenres({ ...genres, [genre]: !genres[genre] });
	};

	const handleAddGenre = (genre) => {
		setGenres({ ...genres, [genre]: true });
		setSearchInput("");
		setShowDropdown(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Only include genres that are set to true
		const selectedGenres = {};
		Object.keys(genres).forEach((key) => {
			if (genres[key] === true) {
				selectedGenres[key] = true;
			}
		});

		const favGenres = Object.keys(selectedGenres);

		try {
			await api.put("/api/user/interests", {
				genres: selectedGenres,
				favGenres,
			});

			// Update local state to match what was saved
			setGenres(selectedGenres);

			if (refreshUser) {
				await refreshUser(); // Refresh user data to update genres
			}
			navigate("/library");
		} catch (err) {
			console.error("Error updating interests:", err);
			alert("Failed to save interests. Please try again.");
		}
	};

	return (
		<div className="interests-wrapper">
			{loading && <Loading />}
			<link rel="stylesheet" href="/normalize.css" />
			<link rel="stylesheet" href="/interests.css" />
			<link
				href="https://fonts.googleapis.com/css?family=Lato|Playfair+Display|Playfair+Display+SC&display=swap"
				rel="stylesheet"
			/>
			<link
				rel="stylesheet"
				href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css"
			/>

			<section id="leftPanel">
				<h1>
					<img src="/images/booksPurple.png" alt="BookIt! Logo" />
				</h1>
				<p>
					<span>Oh!</span>
				</p>
				<p>The Places You'll Go</p>
				<img id="audioGirl" src="/images/audiogirl.png" alt="Audio Girl" />
			</section>

			<section id="rightPanel">
				<div className="container">
					<header>
						<ol>
							<li>
								<img src="/images/purpleplane.png" alt="" />
							</li>
							<li id="interestStep">PROFILE</li>
						</ol>
						<Button variant="secondary" onClick={() => navigate("/library")}>
							← Back to Library
						</Button>
					</header>
					<div className="section-container">
						<h2 className="section-header">Select the Genres You Love Most</h2>
						<p className="section-description">
							Choose your favorite genres to get personalized recommendations
						</p>
					</div>
					<form id="listInput" onSubmit={handleSubmit}>
						<div className="genre-search-wrapper">
							<SearchInput
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder="Search for more genres..."
								onFocus={() => {
									if (searchInput) setShowDropdown(true);
								}}
								onBlur={() => {
									setTimeout(() => setShowDropdown(false), 200);
								}}
							/>

							{showDropdown && searchInput && (
								<div className="genre-dropdown">
									{isSearching ? (
										<div className="genre-dropdown-loading">
											Searching genres...
										</div>
									) : genreSuggestions.length > 0 ? (
										genreSuggestions.map((genre) => (
											<div
												key={genre}
												onClick={() => handleAddGenre(genre)}
												className="genre-dropdown-item"
											>
												{genre}
											</div>
										))
									) : (
										<div className="genre-dropdown-empty">No genre found</div>
									)}
								</div>
							)}
						</div>

						<div className="genre-selection-container">
							<div className="genre-chips-wrapper">
								{Object.keys(genres).map((genre) => {
									const displayName =
										genre === "Science-Fiction"
											? "Science Fiction"
											: genre === "NonFiction"
											? "Non-Fiction"
											: genre === "Juvenile"
											? "Young Adult"
											: genre;
									return (
										<Chip
											key={genre}
											variant="toggle"
											active={genres[genre]}
											onClick={() => handleCheckbox(genre)}
										>
											{displayName}
										</Chip>
									);
								})}
							</div>
						</div>
						<button id="nextButton" type="submit">
							UPDATE
						</button>
					</form>

					<div className="section-container">
						<h2 className="section-header">Add Books You've Read</h2>
						<p className="section-description">
							Search and add books to improve your recommendations
						</p>
						<div className="book-search-wrapper">
							<SearchInput
								value={bookSearchInput}
								onChange={(e) => {
									setBookSearchInput(e.target.value);
									searchBooks(e.target.value);
								}}
								placeholder="Search for books by title or author..."
								onBlur={() => {
									setTimeout(() => setShowBookResults(false), 200);
								}}
							/>
							{showBookResults && bookSearchResults.length > 0 && (
								<div className="genre-dropdown">
									{bookSearchResults.map((book) => (
										<div
											key={book.isbn}
											className="book-result-item"
											onClick={() => handleAddBook(book)}
										>
											<img
												src={book.imageLink}
												alt={book.title}
												className="book-result-image"
												onError={(e) => {
													e.target.src = "/images/StartupBook.svg";
												}}
											/>
											<div className="book-result-info">
												<h4 className="book-result-title">{book.title}</h4>
												<p className="book-result-authors">
													{book.authors.join(", ")}
												</p>
											</div>
											<Button
												variant="primary"
												size="small"
												onClick={(e) => {
													e.stopPropagation();
													handleAddBook(book);
												}}
											>
												Add
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Bookshelf Display */}
					<Bookshelf
						favorites={favorites}
						onRemoveFavorite={handleRemoveFavorite}
					/>
				</div>
			</section>
		</div>
	);
}

export default Profile;
