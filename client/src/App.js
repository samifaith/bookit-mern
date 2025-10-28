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
import Interests from "./components/Interests";
import Library from "./components/Library";
import BookPage from "./components/BookPage";

const ProtectedRoute = ({ children }) => {
	const { user } = useAuth();
	return user ? children : <Navigate to="/login" />;
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
						path="/interests"
						element={
							<ProtectedRoute>
								<Interests />
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
