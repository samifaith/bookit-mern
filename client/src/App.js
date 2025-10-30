import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Library from "./components/Library";
import BookPage from "./components/BookPage";
import Loading from "./components/Loading";

const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	// Show loading spinner while checking authentication
	if (loading) {
		return <Loading />;
	}

	return user ? children : <Navigate to="/login" replace />;
};

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/login" element={<Login />} />
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/library"
						element={
							<ProtectedRoute>
								<Library />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/bookpage"
						element={
							<ProtectedRoute>
								<BookPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
