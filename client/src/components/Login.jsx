import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			// Auto-login with demo account
			await login("demo@bookit.app", "demo123");
			navigate("/library");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Login failed. Please check your credentials."
			);
		}
	};

	return (
		<div className="container">
			<link
				rel="stylesheet"
				href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css"
			/>
			<link
				rel="stylesheet"
				href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css"
			/>
			<link rel="stylesheet" href="/login.css" />

			<div className="col-sm-6 col-sm-offset-3">
				<h1>
					<span className="fa fa-sign-in"></span> Login
				</h1>

				{error && <div className="alert alert-danger">{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Email</label>
						<input
							type="text"
							className="form-control"
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="form-group">
						<label>Password</label>
						<input
							type="password"
							className="form-control"
							name="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<button type="submit" className="btn btn-warning btn-lg">
						Login
					</button>
				</form>

				<hr />

				<p>
					Need an account? <Link to="/signup">Signup</Link>
				</p>
				<p>
					Or go <Link to="/">home</Link>.
				</p>
			</div>
		</div>
	);
}

export default Login;
