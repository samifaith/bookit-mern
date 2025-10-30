import React from "react";
import "./Chip.css";

const Chip = ({
	children,
	active = false,
	onClick,
	count,
	variant = "filter",
	className = "",
	...props
}) => {
	const chipClass = `chip chip-${variant} ${
		active ? "chip-active" : "chip-inactive"
	} ${className}`.trim();

	return (
		<button type="button" className={chipClass} onClick={onClick} {...props}>
			{children}
			{count !== undefined && <span className="chip-count">({count})</span>}
		</button>
	);
};

export default Chip;
