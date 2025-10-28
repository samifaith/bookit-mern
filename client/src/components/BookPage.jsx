import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

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
			console.log("Error checking favorites:", err);
		}
	};

	const fetchBookDetails = async () => {
		try {
			const response = await fetch(
				`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
			);
			const data = await response.json();

			if (data.items && data.items[0]) {
				const bookData = data.items[0].volumeInfo;
				setBook(bookData);

				// Fetch additional data from Open Library for excerpts if available
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
					console.log("Open Library data not available");
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

	if (loading) return <div>Loading...</div>;
	if (!book) return <div>Book not found</div>;

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
				<Link to="/">
					<img src="/images/booksWhiote.png" alt="BookIt! Logo" />
				</Link>
				<Link to="/profile">
					<input type="button" name="" value="PROFILE" />
				</Link>
				<Link to="/interests">
					<input type="button" name="" value="INTERESTS" />
				</Link>
			</header>

			<section id="hero">
				<section id="leftPanel">
					<section id="book">
						<img
							src={
								book.imageLinks?.thumbnail?.replace("zoom=1", "zoom=3") ||
								book.imageLinks?.smallThumbnail?.replace("zoom=5", "zoom=3") ||
								"http://books.google.com/books?vid=OCLC17546826&printsec=frontcover"
							}
							alt={book.title}
							id="bookimage"
						/>
					</section>
				</section>
				<section id="rightPanel">
					<h2>{book.title}</h2>
					<h3>{book.authors?.join(", ") || "Unknown Author"}</h3>
					{book.averageRating ? (
						<p>
							<strong>Rating:</strong> {book.averageRating}/5 (
							{book.ratingsCount || 0} ratings)
						</p>
					) : null}
					{book.categories && book.categories.length > 0 && (
						<p>
							<strong>Genre:</strong> {book.categories.join(", ")}
						</p>
					)}
					{book.publishedDate && (
						<p>
							<strong>Published:</strong> {book.publishedDate}
						</p>
					)}
					<p
						onClick={handleAddToFavorites}
						className={`favorite-btn ${
							isFavorite ? "favorited" : "not-favorited"
						}`}
					>
						{isFavorite ? "★ Remove from Favorites" : "☆ Add to Favorites"}
					</p>
					{book.infoLink && (
						<p>
							<a href={book.infoLink} target="_blank" rel="noopener noreferrer">
								Purchase Link
							</a>
						</p>
					)}
					{book.description && (
						<div className="largeText">
							<strong>Description:</strong>{" "}
							{book.description.replace(/<[^>]*>/g, "")}
						</div>
					)}
					{book.excerpts && book.excerpts.length > 0 && (
						<div className="largeText">
							<strong>Excerpt:</strong> {book.excerpts[0].text}
						</div>
					)}
				</section>
			</section>
		</div>
	);
}

export default BookPage;
