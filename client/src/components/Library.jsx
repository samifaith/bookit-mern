import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import axios from "axios";
import gsap from "gsap";
import Loading from "./Loading";

function Library() {
	const [loading, setLoading] = useState(true);
	const [favorites, setFavorites] = useState([]);
	const [recommendedBooks, setRecommendedBooks] = useState({});
	const [hiddenBooks, setHiddenBooks] = useState(new Set());
	const [currentIndices, setCurrentIndices] = useState({});
	const { user, refreshUser } = useAuth();

	useEffect(() => {
		const loadData = async () => {
			if (refreshUser) {
				await refreshUser();
			}
			if (user && user.favGenres) {
				const currentFavorites = await fetchFavorites();
				await fetchRecommendations(currentFavorites);
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
			const favBooks = response.data.favoriteBooks || [];
			setFavorites(favBooks);
			return favBooks;
		} catch (err) {
			console.error("Error fetching favorites:", err);
			return [];
		}
	};

	const fetchRecommendations = async (currentFavorites = null) => {
		try {
			const favsToCheck =
				currentFavorites !== null ? currentFavorites : favorites;
			const favoritedIsbns = new Set(favsToCheck.map((fav) => fav.isbn));

			// Extract specific subcategories from favorited books for niche matching
			const genreSubcategories = {};

			favsToCheck.forEach((fav) => {
				if (fav.categories && fav.categories.length > 0) {
					fav.categories.forEach((category) => {
						// Parse hierarchical categories like "Fiction / Romance" or "Juvenile Fiction / Science Fiction"
						const fullCategory = category.trim();

						// Map to user's preferred genres with precise matching
						user.favGenres.forEach((genre) => {
							let matches = false;
							const categoryLower = fullCategory.toLowerCase();

							// Normalize genre for comparison
							const normalizedGenre = genre.toLowerCase();

							// Handle special cases for precise matching
							if (
								normalizedGenre === "science-fiction" ||
								normalizedGenre === "science fiction"
							) {
								// Only match if it contains "science" AND "fiction" together
								matches = /science[\s-]*fiction/i.test(fullCategory);
							} else if (
								normalizedGenre === "nonfiction" ||
								normalizedGenre === "non-fiction"
							) {
								// Only match if it contains "non" AND "fiction" together or standalone "nonfiction"
								matches =
									/non[\s-]*fiction/i.test(fullCategory) ||
									categoryLower === "nonfiction";
							} else {
								// For other genres, check if category contains the genre as a whole word
								// Use word boundaries to avoid partial matches
								const genrePattern = new RegExp(
									`\\b${genre.replace(/[-\s]/g, "[\\s-]*")}\\b`,
									"i"
								);
								matches = genrePattern.test(fullCategory);
							}

							if (matches) {
								if (!genreSubcategories[genre]) {
									genreSubcategories[genre] = new Set();
								}
								// Store the most specific category available
								genreSubcategories[genre].add(fullCategory);
							}
						});
					});
				}
			});

			const favGenres = user.favGenres || [];
			const genreRecommendations = {};

			for (const genre of favGenres) {
				const searchTerms = genreSubcategories[genre]
					? Array.from(genreSubcategories[genre])
					: [genre];

				const allCategoryBooks = [];

				for (const searchTerm of searchTerms) {
					const apiTerm = searchTerm
						.toLowerCase()
						.replace(/\s+/g, "+")
						.replace(/\//g, "");

					const response = await fetch(
						`https://www.googleapis.com/books/v1/volumes?q=subject:${apiTerm}&orderBy=relevance&maxResults=40`
					);
					const result = await response.json();
					if (result?.items) {
						allCategoryBooks.push(...result.items);
					}
				}

				// Remove duplicates by ISBN
				const uniqueBooks = [];
				const seenIsbns = new Set();

				allCategoryBooks.forEach((book) => {
					const isbn = book.volumeInfo?.industryIdentifiers?.[0]?.identifier;
					if (isbn && !seenIsbns.has(isbn) && !favoritedIsbns.has(isbn)) {
						seenIsbns.add(isbn);
						uniqueBooks.push(book);
					}
				});

				const shuffled = uniqueBooks.sort(() => 0.5 - Math.random());
				genreRecommendations[genre] = shuffled.slice(0, 20); // Store more books for carousel
			}

			setRecommendedBooks(genreRecommendations);

			// Initialize current indices for each genre
			const indices = {};
			Object.keys(genreRecommendations).forEach((genre) => {
				indices[genre] = 0;
			});
			setCurrentIndices(indices);

			setLoading(false);
		} catch (err) {
			console.error("Error fetching recommendations:", err);
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

	const handleHideBook = (isbn, element) => {
		// Animate the book hiding
		gsap.to(element, {
			opacity: 0,
			scale: 0.8,
			duration: 0.3,
			ease: "power2.in",
			onComplete: () => {
				setHiddenBooks((prev) => new Set([...prev, isbn]));
			},
		});
	};

	const handleNextBooks = (genre) => {
		setCurrentIndices((prev) => {
			const currentIndex = prev[genre] || 0;
			const totalBooks = recommendedBooks[genre]?.length || 0;
			const newIndex =
				currentIndex + 2 < totalBooks ? currentIndex + 2 : currentIndex;
			return { ...prev, [genre]: newIndex };
		});
	};

	const handlePrevBooks = (genre) => {
		setCurrentIndices((prev) => {
			const currentIndex = prev[genre] || 0;
			const newIndex = currentIndex - 2 >= 0 ? currentIndex - 2 : 0;
			return { ...prev, [genre]: newIndex };
		});
	};

	const handleRefreshGenre = async (genre) => {
		setLoading(true);
		try {
			// Clear hidden books for this genre
			const currentHidden = new Set(hiddenBooks);
			recommendedBooks[genre]?.forEach((book) => {
				const isbn = book.volumeInfo?.industryIdentifiers?.[0]?.identifier;
				if (isbn) currentHidden.delete(isbn);
			});
			setHiddenBooks(currentHidden);

			// Fetch new recommendations for this specific genre
			const favoritedIsbns = new Set(favorites.map((fav) => fav.isbn));
			const genreSubcategories = {};

			favorites.forEach((fav) => {
				if (fav.categories && fav.categories.length > 0) {
					fav.categories.forEach((category) => {
						const fullCategory = category.trim();
						const categoryLower = fullCategory.toLowerCase();
						const normalizedGenre = genre.toLowerCase();

						let matches = false;
						if (
							normalizedGenre === "science-fiction" ||
							normalizedGenre === "science fiction"
						) {
							matches = /science[\s-]*fiction/i.test(fullCategory);
						} else if (
							normalizedGenre === "nonfiction" ||
							normalizedGenre === "non-fiction"
						) {
							matches =
								/non[\s-]*fiction/i.test(fullCategory) ||
								categoryLower === "nonfiction";
						} else {
							const genrePattern = new RegExp(
								`\\b${genre.replace(/[-\s]/g, "[\\s-]*")}\\b`,
								"i"
							);
							matches = genrePattern.test(fullCategory);
						}

						if (matches) {
							if (!genreSubcategories[genre]) {
								genreSubcategories[genre] = new Set();
							}
							genreSubcategories[genre].add(fullCategory);
						}
					});
				}
			});

			const searchTerms = genreSubcategories[genre]
				? Array.from(genreSubcategories[genre])
				: [genre];
			const allCategoryBooks = [];

			for (const searchTerm of searchTerms) {
				const apiTerm = searchTerm
					.toLowerCase()
					.replace(/\s+/g, "+")
					.replace(/\//g, "");
				const response = await fetch(
					`https://www.googleapis.com/books/v1/volumes?q=subject:${apiTerm}&orderBy=relevance&maxResults=40`
				);
				const result = await response.json();

				if (result?.items) {
					allCategoryBooks.push(...result.items);
				}
			}

			const uniqueBooks = [];
			const seenIsbns = new Set();

			allCategoryBooks.forEach((book) => {
				const isbn = book.volumeInfo?.industryIdentifiers?.[0]?.identifier;
				if (isbn && !seenIsbns.has(isbn) && !favoritedIsbns.has(isbn)) {
					seenIsbns.add(isbn);
					uniqueBooks.push(book);
				}
			});

			const shuffled = uniqueBooks.sort(() => 0.5 - Math.random());

			setRecommendedBooks((prev) => ({
				...prev,
				[genre]: shuffled.slice(0, 20),
			}));

			setCurrentIndices((prev) => ({
				...prev,
				[genre]: 0,
			}));
		} catch (err) {
			console.error("Error refreshing genre:", err);
		} finally {
			setLoading(false);
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
				const updatedFavorites = favorites.filter((fav) => fav.isbn !== isbn);
				setFavorites(updatedFavorites);
				// Refresh recommendations after unfavoriting - pass updated favorites
				await fetchRecommendations(updatedFavorites);
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
						categories: book.volumeInfo.categories || [],
					},
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const updatedFavorites = [
					...favorites,
					{
						isbn,
						title: book.volumeInfo.title,
						authors: book.volumeInfo.authors,
						imageLink: book.volumeInfo.imageLinks?.thumbnail,
						categories: book.volumeInfo.categories,
					},
				];
				setFavorites(updatedFavorites);
				// Refresh recommendations after favoriting - pass updated favorites
				await fetchRecommendations(updatedFavorites);
			}
		} catch (err) {
			console.error("Error updating favorites:", err);
			alert(err.response?.data?.message || "Error updating favorites");
		}
	};

	if (!user) return <div>Please log in to view your profile</div>;

	return (
		<div>
			{loading && <Loading />}
			<link rel="stylesheet" href="/normalize.css" />
			<link rel="stylesheet" href="/profile.css" />
			<link
				rel="stylesheet"
				href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css"
			/>
			<link
				href="https://fonts.googleapis.com/css?family=Lato|Playfair+Display|Playfair+Display+SC&display=swap"
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
					<button
						className="refresh-button"
						onClick={async () => {
							setLoading(true);
							const currentFavorites = await fetchFavorites();
							await fetchRecommendations(currentFavorites);
						}}
					>
						🔄 Refresh All
					</button>
					<Link to="/profile">
						<input type="button" name="" value="PROFILE" />
					</Link>
				</section>
			</header>

			<div className="hero">
				{loading
					? // Skeleton placeholder while loading
					  user.favGenres?.map((genre, index) => (
							<section className="mainSec" key={index}>
								<div className="topicDiv">
									<section className="topic">
										<h3>{genre}</h3>
									</section>
								</div>
								<div className="recommendDiv">
									{[1, 2].map((i) => (
										<section className="recommend skeleton-placeholder" key={i}>
											<div
												style={{
													width: "120px",
													height: "180px",
													background: "rgba(121, 90, 140, 0.2)",
													borderRadius: "15px",
												}}
											></div>
										</section>
									))}
								</div>
							</section>
					  ))
					: user.favGenres &&
					  user.favGenres.map((genre, genreIndex) => {
							const items = recommendedBooks[genre] || [];
							if (items.length === 0) return null;

							const currentIndex = currentIndices[genre] || 0;

							// Get books starting from currentIndex, filtering out hidden ones
							// Keep going until we have 2 visible books or run out of books
							const visibleBooks = [];
							let searchIndex = currentIndex;
							while (visibleBooks.length < 2 && searchIndex < items.length) {
								const book = items[searchIndex];
								const isbn =
									book?.volumeInfo?.industryIdentifiers?.[0]?.identifier;
								if (isbn && !hiddenBooks.has(isbn)) {
									visibleBooks.push(book);
								}
								searchIndex++;
							}

							const hasMore = searchIndex < items.length;
							const hasPrev = currentIndex > 0;
							const displayGenre =
								genre === "Science-Fiction"
									? "Science Fiction"
									: genre === "NonFiction"
									? "Non-Fiction"
									: genre === "Self-Help"
									? "Self-Help"
									: genre === "Juvenile"
									? "Young Adult"
									: genre;

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
										<div
											style={{ display: "flex", gap: "8px", marginTop: "8px" }}
										></div>
									</div>
									<div className="recommendDiv" data-genre={genre}>
										{hasPrev && (
											<button
												onClick={() => handlePrevBooks(genre)}
												className="carousel-arrow carousel-arrow-prev"
												title="See previous books"
											>
												←
											</button>
										)}
										{visibleBooks.map((book, bookIndex) => {
											if (!book || !book.volumeInfo) return null;
											const info = book.volumeInfo;
											const isbn =
												info.industryIdentifiers?.[0]?.identifier || "";
											const isFavorited = favorites.some(
												(fav) => fav.isbn === isbn
											);

											return (
												<section
													className="recommend"
													key={isbn || bookIndex}
													style={{ position: "relative" }}
													id={`book-${isbn}`}
												>
													<button
														onClick={(e) => {
															const bookElement =
																e.currentTarget.closest(".recommend");
															handleHideBook(isbn, bookElement);
														}}
														style={{
															position: "absolute",
															top: "8px",
															right: "8px",
															background: "rgba(255, 255, 255, 0.15)",
															backdropFilter: "blur(10px)",
															WebkitBackdropFilter: "blur(10px)",
															border: "1px solid rgba(255, 255, 255, 0.3)",
															borderRadius: "50%",
															width: "32px",
															height: "32px",
															cursor: "pointer",
															fontSize: "18px",
															fontWeight: "600",
															color: "rgba(255, 255, 255, 0.9)",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															zIndex: 10,
															boxShadow:
																"0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
															transition: "all 0.3s ease",
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.background =
																"rgba(255, 255, 255, 0.25)";
															e.currentTarget.style.transform = "scale(1.1)";
															e.currentTarget.style.boxShadow =
																"0 6px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.background =
																"rgba(255, 255, 255, 0.15)";
															e.currentTarget.style.transform = "scale(1)";
															e.currentTarget.style.boxShadow =
																"0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
														}}
														title="Hide this book"
													>
														✕
													</button>
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
										{hasMore && (
											<button
												onClick={() => handleNextBooks(genre)}
												className="carousel-arrow carousel-arrow-next"
												title="See more books"
											>
												→
											</button>
										)}
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

export default Library;
