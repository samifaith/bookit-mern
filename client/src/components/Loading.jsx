import React from "react";
import "../styles/loading.css";

function Loading() {
	return (
		<div className="loading-overlay">
			<div className="loading-box">
				{/* Circular path effect */}
				<div className="loading-spinner" />
				{/* Animated paper plane */}
				<img
					src="/images/purpleplane.png"
					alt="Loading..."
					className="loading-plane"
				/>
			</div>
			<p className="loading-text">Loading your books...</p>
		</div>
	);
}

export default Loading;
