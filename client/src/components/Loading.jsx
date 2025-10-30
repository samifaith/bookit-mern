import React from "react";

function Loading() {
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				background: "rgba(0, 0, 0, 0.3)",
				backdropFilter: "blur(8px) saturate(150%)",
				WebkitBackdropFilter: "blur(8px) saturate(150%)",
				zIndex: 9999,
			}}
		>
			<div
				style={{
					position: "relative",
					width: "160px",
					height: "160px",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					background: "rgba(255, 255, 255, 0.25)",
					borderRadius: "24px",
					backdropFilter: "blur(20px)",
					WebkitBackdropFilter: "blur(20px)",
					boxShadow:
						"0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
					border: "1px solid rgba(255, 255, 255, 0.4)",
				}}
			>
				{/* Circular path effect */}
				<div
					style={{
						width: "80px",
						height: "80px",
						border: "3px solid rgba(240, 240, 240, 0.5)",
						borderTop: "3px solid var(--color-primary, #4100f4)",
						borderRadius: "50%",
						position: "absolute",
						animation: "spin 1.5s linear infinite",
					}}
				/>

				{/* Animated paper plane */}
				<img
					src="/images/purpleplane.png"
					alt="Loading..."
					style={{
						width: "60px",
						height: "60px",
						position: "absolute",
						animation: "fly 2s ease-in-out infinite",
						zIndex: 10,
					}}
				/>
			</div>

			<p
				style={{
					marginTop: "24px",
					fontFamily: "Lato, sans-serif",
					fontSize: "16px",
					color: "var(--color-text-light, #d1a0ee)",
					fontWeight: "500",
					textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			>
				Loading your books...
			</p>

			<style>
				{`
					@keyframes spin {
						0% {
							transform: rotate(0deg);
						}
						100% {
							transform: rotate(360deg);
						}
					}

					@keyframes fly {
						0%, 100% {
							transform: translateY(0px) rotate(0deg);
						}
						25% {
							transform: translateY(-8px) rotate(-5deg);
						}
						75% {
							transform: translateY(8px) rotate(5deg);
						}
					}

					@keyframes pulse {
						0%, 100% {
							opacity: 1;
						}
						50% {
							opacity: 0.6;
						}
					}
				`}
			</style>
		</div>
	);
}

export default Loading;
