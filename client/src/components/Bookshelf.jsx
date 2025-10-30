import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Button, Chip } from "./ui";
import "./Bookshelf.css";

function Bookshelf({ favorites, onRemoveFavorite }) {
	const navigate = useNavigate();
	const [expandedShelves, setExpandedShelves] = useState({});
	const [hiddenGenres, setHiddenGenres] = useState(new Set());
	const [booksPerShelf, setBooksPerShelf] = useState(15);
	const shelfRefs = useRef({});
	const currentlyExpandedBook = useRef(null);

	// Calculate books per shelf based on screen width
	useEffect(() => {
		const calculateBooksPerShelf = () => {
			const screenWidth = window.innerWidth;
			// Book spine width: 40px, gap: 15px, padding: 40px (20px each side)
			// Account for container padding: 40px per side
			const availableWidth = screenWidth - 120; // 40px padding left + 40px padding right + 40px buffer
			const bookWidthWithGap = 40 + 15; // spine width + gap
			const maxBooks = Math.floor(availableWidth / bookWidthWithGap);
			// Minimum 5 books, maximum 20 books per shelf
			setBooksPerShelf(Math.max(5, Math.min(20, maxBooks)));
		};

		calculateBooksPerShelf();
		window.addEventListener("resize", calculateBooksPerShelf);
		return () => window.removeEventListener("resize", calculateBooksPerShelf);
	}, []);

	// Split books into multiple rows based on booksPerShelf
	const splitIntoRows = (books) => {
		const rows = [];
		for (let i = 0; i < books.length; i += booksPerShelf) {
			rows.push(books.slice(i, i + booksPerShelf));
		}
		return rows;
	};

	// Category mapping to consolidate subcategories into main categories
	const categoryMapping = {
		"Body, Mind & Spirit": "Self-Help",
		"Body, Mind, Spirit": "Self-Help",
		"Self-Help": "Self-Help",
		"Health & Fitness": "Self-Help",
		Psychology: "Self-Help",
		Philosophy: "Self-Help",
		Religion: "Self-Help",
		"Juvenile Fiction": "Young Adult",
		"Juvenile Nonfiction": "Young Adult",
		"Young Adult Fiction": "Young Adult",
		"Young Adult Nonfiction": "Young Adult",
		"Comics & Graphic Novels": "Graphic Novels",
		"True Crime": "Crime",
		"Literary Criticism": "Non-Fiction",
		"Literary Collections": "Non-Fiction",
		Cooking: "Non-Fiction",
		Travel: "Non-Fiction",
		"Business & Economics": "Non-Fiction",
		"Political Science": "Non-Fiction",
		"Social Science": "Non-Fiction",
		Science: "Non-Fiction",
		"Technology & Engineering": "Non-Fiction",
		Mathematics: "Non-Fiction",
		Medical: "Non-Fiction",
		Law: "Non-Fiction",
		Education: "Non-Fiction",
		Architecture: "Non-Fiction",
		Art: "Non-Fiction",
		Music: "Non-Fiction",
		"Performing Arts": "Non-Fiction",
		Photography: "Non-Fiction",
		"Crafts & Hobbies": "Non-Fiction",
		"Games & Activities": "Non-Fiction",
		Gardening: "Non-Fiction",
		"House & Home": "Non-Fiction",
		Nature: "Non-Fiction",
		Pets: "Non-Fiction",
		"Sports & Recreation": "Non-Fiction",
		Transportation: "Non-Fiction",
	};

	// Group favorites by genre/category
	const groupedByGenre = favorites.reduce((acc, book) => {
		// Extract main category (before the first "/") or use default
		let mainCategory = "Fiction"; // Default to Fiction instead of Uncategorized
		if (book.categories && book.categories.length > 0) {
			const fullCategory = book.categories[0];
			// Split by "/" and take the first part, trim whitespace
			const extractedCategory = fullCategory.split("/")[0].trim();
			// Map to broader category or use as-is
			mainCategory = categoryMapping[extractedCategory] || extractedCategory;
		}

		if (!acc[mainCategory]) {
			acc[mainCategory] = [];
		}
		acc[mainCategory].push(book);
		return acc;
	}, {});

	// Get list of all genres for filtering
	const allGenres = Object.keys(groupedByGenre).sort();

	// Toggle genre visibility
	const toggleGenreVisibility = (genre) => {
		setHiddenGenres((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(genre)) {
				newSet.delete(genre);
			} else {
				newSet.add(genre);
			}
			return newSet;
		});
	};

	// Show/hide all genres
	const toggleAllGenres = (show) => {
		if (show) {
			setHiddenGenres(new Set());
		} else {
			setHiddenGenres(new Set(allGenres));
		}
	};

	// Toggle shelf expansion with GSAP animation
	const toggleShelf = (genre) => {
		const isExpanding = !expandedShelves[genre];

		// Find all shelf rows for this genre
		const shelfCategory = document.querySelector(`[data-genre="${genre}"]`);
		if (!shelfCategory) return;

		const shelfRows = shelfCategory.querySelectorAll(".shelf");
		const toggleButton = shelfCategory.querySelector(".shelf-toggle");

		if (!toggleButton) return;

		// Animate toggle button rotation
		gsap.to(toggleButton, {
			rotation: isExpanding ? 180 : 0,
			duration: 0.4,
			ease: "back.out(1.7)",
		});

		shelfRows.forEach((shelf, shelfIndex) => {
			const booksRow = shelf.querySelector(".books-row");
			if (!booksRow) return;

			if (isExpanding) {
				// Expanding animation with stagger for multiple shelves
				gsap.to(booksRow, {
					height: "auto",
					opacity: 1,
					duration: 0.6,
					delay: shelfIndex * 0.1,
					ease: "power3.out",
				});

				// Animate books sliding in with stagger
				const books = booksRow.querySelectorAll(".book-spine");
				gsap.fromTo(
					books,
					{
						y: 40,
						opacity: 0,
						scale: 0.8,
					},
					{
						y: 0,
						opacity: 1,
						scale: 1,
						duration: 0.5,
						delay: shelfIndex * 0.1,
						ease: "back.out(1.2)",
						stagger: {
							amount: 0.3,
							from: "start",
						},
					}
				);
			} else {
				// Collapsing animation
				gsap.to(booksRow, {
					height: 0,
					opacity: 0,
					duration: 0.4,
					ease: "power2.in",
				});
			}
		});

		setExpandedShelves((prev) => ({
			...prev,
			[genre]: isExpanding,
		}));
	};

	// Generate random spine colors for variety
	const getSpineColor = (index) => {
		const colors = [
			"linear-gradient(to right, #f8f6ff 0%, #e6dbff 50%, #d4c5ff 100%)", // Purple
			"linear-gradient(to right, #fff5f5 0%, #ffe0e0 50%, #ffc5c5 100%)", // Pink
			"linear-gradient(to right, #f0f9ff 0%, #dbeafe 50%, #bfdbfe 100%)", // Blue
			"linear-gradient(to right, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)", // Green
			"linear-gradient(to right, #fefce8 0%, #fef3c7 50%, #fde68a 100%)", // Yellow
			"linear-gradient(to right, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)", // Orange
		];
		return colors[index % colors.length];
	};

	const handleViewBook = (isbn) => {
		navigate(`/bookpage?isbn=${isbn}`);
	};

	// GSAP hover animations for books
	const handleBookHover = (e, isEntering) => {
		const bookSpine = e.currentTarget;
		const titleSpine = bookSpine.querySelector(".book-title-spine");
		const bookCover = bookSpine.querySelector(".book-cover");

		if (isEntering) {
			// If another book is currently expanded, collapse it first
			if (
				currentlyExpandedBook.current &&
				currentlyExpandedBook.current !== bookSpine
			) {
				const prevBookSpine = currentlyExpandedBook.current;
				const prevTitleSpine = prevBookSpine.querySelector(".book-title-spine");
				const prevBookCover = prevBookSpine.querySelector(".book-cover");

				// Kill any ongoing animations on previous book
				gsap.killTweensOf([prevBookSpine, prevTitleSpine, prevBookCover]);

				// Instantly collapse previous book
				gsap.to(prevBookSpine, {
					width: 40,
					duration: 0.3,
					ease: "power2.in",
				});
				gsap.to(prevTitleSpine, {
					opacity: 1,
					duration: 0.2,
					ease: "power2.out",
				});

				gsap.to(prevBookCover, {
					opacity: 0,
					duration: 0.2,
					ease: "power2.in",
				});
			}

			// Kill any ongoing animations on current book
			gsap.killTweensOf([bookSpine, titleSpine, bookCover]);

			// Set this as the currently expanded book
			currentlyExpandedBook.current = bookSpine;

			// Expand book with proper aspect ratio (2:3 = 160px width for 240px height)
			gsap.to(bookSpine, {
				width: 160,
				duration: 0.5,
				ease: "power2.out",
				zIndex: 10,
			}); // Fade out spine title
			gsap.to(titleSpine, {
				opacity: 0,
				duration: 0.3,
				ease: "power2.in",
			});

			// Fade in book cover with slight scale
			gsap.fromTo(
				bookCover,
				{
					opacity: 0,
					scale: 0.95,
				},
				{
					opacity: 1,
					scale: 1,
					duration: 0.4,
					delay: 0.15,
					ease: "power2.out",
				}
			);
		} else {
			// Clear currently expanded book reference
			if (currentlyExpandedBook.current === bookSpine) {
				currentlyExpandedBook.current = null;
			}

			// Kill any ongoing animations
			gsap.killTweensOf([bookSpine, titleSpine, bookCover]);

			// Collapse book to spine width
			gsap.to(bookSpine, {
				width: 40,
				duration: 0.4,
				ease: "power2.in",
				zIndex: 1,
			}); // Fade in spine title
			gsap.to(titleSpine, {
				opacity: 1,
				duration: 0.3,
				delay: 0.1,
				ease: "power2.out",
			});

			// Fade out book cover
			gsap.to(bookCover, {
				opacity: 0,
				duration: 0.25,
				ease: "power2.in",
			});
		}
	};

	if (favorites.length === 0) {
		return null;
	}

	return (
		<div className="bookshelf-container">
			<h2 className="bookshelf-title">Your Personal Bookshelf</h2>

			{allGenres.length > 0 && (
				<div className="genre-filter-container">
					<div className="filter-controls">
						<Button
							variant="secondary"
							size="small"
							onClick={() => toggleAllGenres(true)}
						>
							Show All
						</Button>
						<Button
							variant="secondary"
							size="small"
							onClick={() => toggleAllGenres(false)}
						>
							Hide All
						</Button>
					</div>
					<div className="genre-chips">
						{allGenres.map((genre) => (
							<Chip
								key={genre}
								active={!hiddenGenres.has(genre)}
								onClick={() => toggleGenreVisibility(genre)}
								variant="filter"
								count={groupedByGenre[genre].length}
							>
								{genre}
							</Chip>
						))}
					</div>
				</div>
			)}

			{Object.entries(groupedByGenre)
				.filter(([genre]) => !hiddenGenres.has(genre))
				.map(([genre, books], genreIndex) => {
					const bookRows = splitIntoRows(books);
					return (
						<div key={genre} className="shelf-category" data-genre={genre}>
							<div className="shelf-header" onClick={() => toggleShelf(genre)}>
								<div className="shelf-header-left">
									<h3 className="shelf-genre">{genre}</h3>
									<span className="shelf-count">
										{books.length} {books.length === 1 ? "book" : "books"}
									</span>
								</div>
								<button className="shelf-toggle" aria-label="Toggle shelf">
									▼
								</button>
							</div>

							{bookRows.map((rowBooks, rowIndex) => (
								<div
									key={`${genre}-row-${rowIndex}`}
									ref={(el) => {
										if (rowIndex === 0) shelfRefs.current[genre] = el;
									}}
									className={`shelf ${
										expandedShelves[genre] ? "expanded" : "collapsed"
									}`}
								>
									<div className="books-row">
										{rowBooks.map((book, bookIndex) => (
											<div
												key={book.isbn}
												className="book-spine"
												onMouseEnter={(e) => handleBookHover(e, true)}
												onMouseLeave={(e) => handleBookHover(e, false)}
											>
												<div
													className="book-spine-inner"
													style={{
														background: getSpineColor(
															genreIndex * 10 +
																rowIndex * booksPerShelf +
																bookIndex
														),
													}}
												>
													<div className="book-title-spine">{book.title}</div>

													{/* Expanded Book Cover - shown on hover */}
													<div className="book-cover">
														<img
															src={book.imageLink || "/images/StartupBook.svg"}
															alt={book.title}
															className="book-cover-image"
															onError={(e) => {
																e.target.src = "/images/StartupBook.svg";
															}}
														/>
														<h4 className="book-cover-title">{book.title}</h4>
														<p className="book-cover-author">
															{book.authors?.join(", ") || "Unknown Author"}
														</p>
														<div className="book-actions">
															<Button
																variant="primary"
																size="small"
																onClick={() => handleViewBook(book.isbn)}
															>
																View
															</Button>
															<Button
																variant="danger"
																size="small"
																onClick={(e) => {
																	e.stopPropagation();
																	onRemoveFavorite(book.isbn);
																}}
															>
																Remove
															</Button>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					);
				})}
		</div>
	);
}

export default Bookshelf;
