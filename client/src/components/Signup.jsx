import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import SearchInput from "./ui/SearchInput";

function Signup() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			// Auto-login with demo account
			await login("demo@bookit.app", "demo123");
			navigate("/profile");
		} catch (err) {
			console.error("Signup error:", err);
			setError(
				err.response?.data?.message || err.message || "Unable to continue"
			);
		}
	};

	return (
		<div className="signup-wrapper">
			<link rel="stylesheet" href="/normalize.css" />
			<link rel="stylesheet" href="/signup.css" />
			<link
				href="https://fonts.googleapis.com/css?family=Lato|Playfair+Display|Playfair+Display+SC&display=swap"
				rel="stylesheet"
			/>
			<link
				rel="stylesheet"
				href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css"
			/>

			{error && <div className="alert alert-danger">{error}</div>}

			<section id="leftPanel">
				<h1>
					<img src="/images/booksPurple.png" alt="BookIt! Logo" />
				</h1>
				<p>
					<span>Oh!</span>
				</p>
				<p>
					<strong>The Places You'll Go</strong>
				</p>
				<img id="audioGirl" src="/images/audiogirl.png" alt="Audio Girl" />
			</section>

			<section id="rightPanel">
				<header>
					<ol>
						<li id="accountStep">
							<strong>ACCOUNT</strong>
						</li>
						<li>
							<img src="/images/purpleplane.png" alt="planes" />
						</li>
						<li id="interestStep">INTERESTS</li>
					</ol>
				</header>
				<div className="container">
					<form onSubmit={handleSubmit}>
						<p className="form-description">
							Create an account to discover your next great read.
						</p>
						<div className="form-group">
							<label htmlFor="firstName">First Name</label>
							<SearchInput
								type="text"
								id="firstName"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
								placeholder="Enter your first name"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="lastName">Last Name</label>
							<SearchInput
								type="text"
								id="lastName"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								placeholder="Enter your last name"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="email">Email</label>
							<SearchInput
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Enter your email"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="password">Password</label>
							<SearchInput
								type="password"
								id="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter your password"
							/>
						</div>
						<Button
							type="submit"
							variant="primary"
							size="large"
							className="submit-button"
						>
							NEXT
						</Button>
					</form>
					<p className="login-link">
						Already have an account? <Link to="/login">Login</Link>
					</p>
				</div>
			</section>
		</div>
	);
}

export default Signup;
