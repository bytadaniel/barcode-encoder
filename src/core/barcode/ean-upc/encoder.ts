import { BINARIES } from './constants'

// Encode data string
const encode = (data: string, structure: any, separator?: any) => {
	let encoded = data
		.split('')
		.map((_val, idx) => BINARIES[structure[idx] as keyof typeof BINARIES])
		.map((val, idx) => val ? val[data[idx] as any] : '');

	if (separator) {
		const last = data.length - 1;
		encoded = encoded.map((val, idx) => (
			idx < last ? val + separator : val
		));
	}

	return encoded.join('');
};

export default encode;
