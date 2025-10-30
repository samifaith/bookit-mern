import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import { Button } from "./ui";

function BookPage() {
	const [book, setBook] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isFavorite, setIsFavorite] = useState(false);
	const [searchParams] = useSearchParams();
	const isbn = searchParams.get("isbn");

	useEffect(() => {
		if (isbn) {
			fetchBookDetails();
			checkIfFavorite();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isbn]);

	const checkIfFavorite = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return;

			const response = await axios.get(
				"http://localhost:7070/api/user/favorites",
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			const isFav = response.data.favoriteBooks?.some(
				(book) => book.isbn === isbn
			);
			setIsFavorite(isFav);
		} catch (err) {
			console.error("Error checking favorites:", err);
		}
	};

	const fetchBookDetails = async () => {
		try {
			// First, try to get the book from favorites to get the title
			const token = localStorage.getItem("token");
			let bookTitle = null;

			if (token) {
				try {
					const favResponse = await axios.get(
						"http://localhost:7070/api/user/favorites",
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					const favoriteBook = favResponse.data.favoriteBooks?.find(
						(book) => book.isbn === isbn
					);
					if (favoriteBook) {
						bookTitle = favoriteBook.title;
					}
				} catch (err) {
					// Could not fetch from favorites, will try direct search
				}
			}

			const isStandardIsbn = /^[0-9-X]+$/.test(isbn);

			let response;
			if (isStandardIsbn) {
				response = await fetch(
					`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
				);
			} else if (bookTitle) {
				response = await fetch(
					`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
						bookTitle
					)}`
				);
			} else {
				response = await fetch(
					`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
						isbn
					)}`
				);
			}

			const data = await response.json();

			if (data.items && data.items[0]) {
				const bookData = data.items[0].volumeInfo;
				setBook(bookData);

				// Fetch additional data from Open Library for excerpts if available (only for standard ISBNs)
				if (isStandardIsbn) {
					try {
						const olResponse = await fetch(
							`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
						);
						const olData = await olResponse.json();
						const olBook = olData[`ISBN:${isbn}`];

						if (olBook && olBook.excerpts && olBook.excerpts.length > 0) {
							setBook((prev) => ({
								...prev,
								excerpts: olBook.excerpts,
							}));
						}
					} catch (olErr) {
						// Open Library data not available
					}
				}
			}
			setLoading(false);
		} catch (err) {
			console.error("Error fetching book:", err);
			setLoading(false);
		}
	};

	const handleAddToFavorites = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				alert("Please log in to add favorites");
				return;
			}

			if (isFavorite) {
				// Remove from favorites
				await axios.delete(`http://localhost:7070/api/user/favorites/${isbn}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setIsFavorite(false);
				alert("Removed from favorites!");
			} else {
				// Add to favorites
				await axios.post(
					"http://localhost:7070/api/user/favorites",
					{
						isbn,
						title: book.title,
						authors: book.authors || [],
						imageLink:
							book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail,
						categories: book.categories || [],
					},
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setIsFavorite(true);
				alert("Added to favorites!");
			}
		} catch (err) {
			console.error("Error updating favorites:", err);
			alert(err.response?.data?.message || "Error updating favorites");
		}
	};

	if (loading) {
		return (
			<div className="bookpage-wrapper">
				<Loading />
			</div>
		);
	}

	if (!book) {
		return (
			<div className="bookpage-wrapper">
				<div className="book-not-found-message">Book not found</div>
			</div>
		);
	}

	return (
		<div className="bookpage-wrapper">
			<link
				rel="stylesheet"
				href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css"
			/>
			<link rel="stylesheet" href="/normalize.css" />
			<link rel="stylesheet" href="/bookpage.css" />
			<link
				href="https://fonts.googleapis.com/css?family=Lato|Playfair+Display|Playfair+Display+SC&display=swap"
				rel="stylesheet"
			/>
			<link
				rel="stylesheet"
				href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css"
			/>

			<header>
				<Link to="/library" style={{ textDecoration: "none" }}>
					<Button variant="secondary" size="medium">
						<img
							src="/images/purpleplane.png"
							alt="Back"
							className="back-arrow"
						/>
						<span className="back-text">BACK TO LIBRARY</span>
					</Button>
				</Link>
				<Link to="/" className="logo-link">
					<img src="/images/booksPurple.png" alt="BookIt! Logo" />
				</Link>
			</header>

			<section id="hero">
				<section id="leftPanel">
					<div id="bookContainer">
						<img
							src={
								book.imageLinks?.thumbnail?.replace("zoom=1", "zoom=3") ||
								book.imageLinks?.smallThumbnail?.replace("zoom=5", "zoom=3") ||
								"http://books.google.com/books?vid=OCLC17546826&printsec=frontcover"
							}
							alt={book.title}
							id="bookimage"
						/>
						<div className="book-actions">
							<Button
								variant={isFavorite ? "danger" : "primary"}
								onClick={handleAddToFavorites}
								className="favorite-button"
							>
								{isFavorite ? "★ FAVORITED" : "☆ ADD TO FAVORITES"}
							</Button>
						</div>
					</div>
				</section>
				<section id="rightPanel">
					<div className="book-header">
						<h1 className="book-title">{book.title}</h1>
						<h2 className="book-author">
							by {book.authors?.join(", ") || "Unknown Author"}
						</h2>
					</div>

					<div className="book-description">
						<p className="description-text">
							{book.description
								? book.description.replace(/<[^>]*>/g, "")
								: "No description available."}
						</p>
					</div>

					<div className="book-meta">
						<div className="meta-row">
							<div className="meta-item">
								<span className="meta-label">Editors</span>
								<span className="meta-value">
									{book.publisher || "Unknown"}
								</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">Release Date</span>
								<span className="meta-value">
									{book.publishedDate || "Unknown"}
								</span>
							</div>
						</div>
						<div className="meta-row">
							<div className="meta-item">
								<span className="meta-label">Format</span>
								<span className="meta-value">
									{book.printType || "Digital"}
								</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">Features</span>
								<span className="meta-value">
									{book.pageCount ? `${book.pageCount} pages` : "Full color"}
								</span>
							</div>
						</div>
						<div className="meta-row">
							<div className="meta-item">
								<span className="meta-label">Language</span>
								<span className="meta-value">
									{book.language === "en" ? "English" : book.language}
								</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">ISBN</span>
								<span className="meta-value">{isbn}</span>
							</div>
						</div>
					</div>

					{book.averageRating && (
						<div className="book-review">
							<div className="reviewer-info">
								<div className="reviewer-avatar">
									{book.authors?.[0]?.charAt(0) || "?"}
								</div>
								<div className="reviewer-details">
									<span className="reviewer-name">Reviewed By</span>
									<span className="reviewer-subtitle">Reader Community</span>
								</div>
							</div>
							<p className="review-text">
								"{book.averageRating}/5 stars - Based on{" "}
								{book.ratingsCount || 0} reader reviews"
							</p>
						</div>
					)}

					{book.excerpts && book.excerpts.length > 0 && (
						<div className="book-excerpt">
							<p className="excerpt-text">"{book.excerpts[0].text}"</p>
						</div>
					)}
				</section>
			</section>
		</div>
	);
}

export default BookPage;
