import { Chess } from "chess.js";

const pieceValues = {
	p: 1,
	n: 3,
	b: 3,
	r: 5,
	q: 9,
	k: 0,
} as const;

export const calculateMaterial = (chess: Chess) => {
	let whiteMaterial = 0;
	let blackMaterial = 0;

	for (const row of chess.board()) {
		for (const piece of row) {
			if (!piece) continue;

			const value = pieceValues[piece.type];

			if (piece.color === "w") {
				whiteMaterial += value;
			} else {
				blackMaterial += value;
			}
		}
	}

	const material = {
		white: whiteMaterial,
		black: blackMaterial,
		advantage: whiteMaterial - blackMaterial,
	};

	return material;
}