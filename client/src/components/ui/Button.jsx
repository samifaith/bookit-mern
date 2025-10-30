import React from "react";
import "./Button.css";

const Button = ({
	children,
	variant = "primary",
	size = "medium",
	onClick,
	type = "button",
	disabled = false,
	className = "",
	...props
}) => {
	const buttonClass = `btn btn-${variant} btn-${size} ${className}`.trim();

	return (
		<button
			type={type}
			className={buttonClass}
			onClick={onClick}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
