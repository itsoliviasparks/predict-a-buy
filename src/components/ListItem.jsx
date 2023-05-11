import { useState, useEffect } from 'react';

import { updateItem, deleteItem } from '../api/firebase';
import { ONE_DAY_IN_MILLISECONDS } from '../utils';

import './ListItem.css';

export function ListItem({
	name,
	listToken,
	itemId,
	dateLastPurchased,
	dateNextPurchased,
}) {
	const [prevDateLastPurchased, setPrevDateLastPurchased] = useState(null);
	const [prevDateNextPurchased, setPrevDateNextPurchased] = useState(null);
	const [disabled, setDisabled] = useState(false);

	const currentDate = new Date().getTime();
	const dateLastPurchasedPlus24h = dateLastPurchased
		? dateLastPurchased.toDate().getTime() + ONE_DAY_IN_MILLISECONDS
		: null;

	const wasPurchased = currentDate < dateLastPurchasedPlus24h;

	//disables ability to uncheck item if the item was marked as purchased on page load
	useEffect(() => {
		if (!prevDateLastPurchased && !prevDateNextPurchased) {
			setDisabled(wasPurchased);
		}
	}, [wasPurchased, prevDateNextPurchased, prevDateLastPurchased]);

	const handleCheck = () => {
		//save previous dateLastPurchased & dateNextPurchased into state to use if the user unchecks an item
		setPrevDateLastPurchased(dateLastPurchased);
		setPrevDateNextPurchased(dateNextPurchased);

		updateItem(
			wasPurchased,
			listToken,
			itemId,
			prevDateLastPurchased,
			prevDateNextPurchased,
		);
	};

	const handleDelete = (e) => {
		e.preventDefault();
		if (window.confirm(`Are you sure you want to delete ${name}?`)) {
			deleteItem(listToken, itemId);
		}
	};

	return (
		<li className="ListItem">
			<label
				htmlFor="wasPurchased"
				aria-label={
					disabled
						? 'Not available for purchase until 24 hours have passed since the previous purchase'
						: 'Did you purchase the item?'
				}
			></label>
			<input
				type="checkbox"
				name="wasPurchased"
				id="wasPurchased"
				value={name}
				title={
					disabled
						? 'Not available for purchase until 24 hours have passed since the previous purchase'
						: 'Did you purchase the item?'
				}
				checked={wasPurchased}
				disabled={disabled}
				onChange={handleCheck}
			/>
			{name}
			<button
				onClick={(e) => {
					handleDelete(e);
				}}
			>
				Delete
			</button>
		</li>
	);
}
