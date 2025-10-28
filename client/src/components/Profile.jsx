import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
	const { user, refreshUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user && user.genres) {
			setGenres(user.genres);
		}
		fetchFavorites();
		setLoading(false);
	}, [user]);

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

	const handleCheckbox = (genre) => {
		setGenres({ ...genres, [genre]: !genres[genre] });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const favGenres = Object.keys(genres).filter((key) => genres[key]);

		try {
			await api.put("/api/user/interests", { genres, favGenres });
			if (refreshUser) {
				await refreshUser(); // Refresh user data to update genres
			}
			navigate("/library");
		} catch (err) {
			console.error("Error updating interests:", err);
			alert("Failed to save interests. Please try again.");
		}
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className="interests-wrapper">
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
							<li id="accountStep">ACCOUNT</li>
							<li>
								<img src="/images/purpleplane.png" alt="" />
							</li>
							<li id="interestStep">PROFILE</li>
						</ol>
					</header>
					<p>Select the genres you love most.</p>
					<form id="listInput" onSubmit={handleSubmit}>
						<div className="">
							<input
								type="checkbox"
								name="genre"
								value="Romance"
								checked={genres.Romance}
								onChange={() => handleCheckbox("Romance")}
							/>
							<label htmlFor="Romance">Romance</label>
							<input
								type="checkbox"
								name="genre"
								value="Mystery"
								checked={genres.Mystery}
								onChange={() => handleCheckbox("Mystery")}
							/>
							<label htmlFor="Mystery">Mystery</label>
							<input
								type="checkbox"
								name="genre"
								value="Fantasy"
								checked={genres.Fantasy}
								onChange={() => handleCheckbox("Fantasy")}
							/>
							<label htmlFor="Fantasy">Fantasy</label>
						</div>
						<div className="">
							<input
								type="checkbox"
								name="genre"
								value="Science-Fiction"
								checked={genres["Science-Fiction"]}
								onChange={() => handleCheckbox("Science-Fiction")}
							/>
							<label htmlFor="Science-Fiction">Science Fiction</label>
							<input
								type="checkbox"
								name="genre"
								value="Thriller"
								checked={genres.Thriller}
								onChange={() => handleCheckbox("Thriller")}
							/>
							<label htmlFor="Thriller">Thriller</label>
							<input
								type="checkbox"
								name="genre"
								value="Juvenile"
								checked={genres.Juvenile}
								onChange={() => handleCheckbox("Juvenile")}
							/>
							<label htmlFor="Juvenile">Young Adult</label>
						</div>
						<div className="">
							<input
								type="checkbox"
								name="genre"
								value="NonFiction"
								checked={genres.NonFiction}
								onChange={() => handleCheckbox("NonFiction")}
							/>
							<label htmlFor="NonFiction">Non-Fiction</label>
							<input
								type="checkbox"
								name="genre"
								value="Fiction"
								checked={genres.Fiction}
								onChange={() => handleCheckbox("Fiction")}
							/>
							<label htmlFor="Fiction">Fiction</label>
							<input
								type="checkbox"
								name="genre"
								value="Self-Help"
								checked={genres["Self-Help"]}
								onChange={() => handleCheckbox("Self-Help")}
							/>
							<label htmlFor="Self-Help">Self-Help</label>
						</div>
						<button id="nextButton" type="submit">
							SUBMIT
						</button>
					</form>

					{favorites.length > 0 && (
						<div style={{ marginTop: "40px" }}>
							<h3
								style={{
									fontFamily: "Playfair Display, serif",
									color: "#4100f4",
									marginBottom: "20px",
								}}
							>
								Your Favorite Books
							</h3>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
									gap: "20px",
								}}
							>
								{favorites.map((book) => (
									<div
										key={book.isbn}
										style={{
											textAlign: "center",
											position: "relative",
										}}
									>
										<img
											src={book.imageLink || "/images/StartupBook.svg"}
											alt={book.title}
											style={{
												width: "100%",
												maxWidth: "128px",
												height: "auto",
												boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
												marginBottom: "10px",
											}}
											onError={(e) => {
												e.target.src = "/images/StartupBook.svg";
											}}
										/>
										<p
											style={{
												fontSize: "14px",
												fontWeight: "bold",
												margin: "5px 0",
											}}
										>
											{book.title}
										</p>
										<p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
											{book.authors?.join(", ")}
										</p>
										<div
											onClick={() => handleRemoveFavorite(book.isbn)}
											style={{
												cursor: "pointer",
												display: "inline-flex",
												alignItems: "center",
												gap: "5px",
											}}
										>
											<i
												className="fas fa-heart"
												style={{
													color: "#f44100",
													fontSize: "20px",
												}}
											></i>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}

export default Profile;
