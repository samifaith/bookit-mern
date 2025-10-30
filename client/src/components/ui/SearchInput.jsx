import React from "react";
import "./SearchInput.css";

const SearchInput = ({
	value,
	onChange,
	placeholder = "Search...",
	onFocus,
	onBlur,
	className = "",
	...props
}) => {
	return (
		<input
			type="text"
			className={`search-input ${className}`.trim()}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			onFocus={onFocus}
			onBlur={onBlur}
			{...props}
		/>
	);
};

export default SearchInput;
