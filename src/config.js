export const urls = {
	options: 'https://raw.githubusercontent.com/ONSvisual/census-data/main/csv/lists/places_2020.csv',
	places: 'https://raw.githubusercontent.com/ONSvisual/census-data/main/json/place/',
	quantiles: 'https://raw.githubusercontent.com/ONSvisual/census-data/main/json/quantiles/quartiles_'
};

export const types = {
	ew: {name: '', pl: ''},
	wd: {name: 'Ward', pl: 'Wards'},
	lad: {name: 'District', pl: 'Districts'},
	rgn: {name: 'Region', pl: 'Regions'},
	ctry: {name: 'Country', pl: 'Countries'}
};

export const codes = {
	age10yr: [
		{code: '0-9'},
		{code: '10-19'},
		{code: '20-29'},
		{code: '30-39'},
		{code: '40-49'},
		{code: '50-59'},
		{code: '60-69'},
		{code: '70plus', label: '70+'}
	],
	economic: [
		{code: 'employee'},
		{code: 'self-employed'},
		{code: 'student', label: 'student (employed)'},
		{code: 'unemployed'},
		{code: 'inactive'}
	],
	ethnicity: [
		{code: 'white'},
		{code: 'asian'},
		{code: 'black'},
		{code: 'mixed'},
		{code: 'other'}
	],
	population: [
		{code: 'female'},
		{code: 'male'}
	],
	health: [
		{code: 'good'},
		{code: 'fair'},
		{code: 'bad'}
	],
	tenure: [
		{code: 'owned', label: 'owner occupied'},
		{code: 'shared_ownership', label: 'shared ownership'},
		{code: 'rented_private', label: 'rented (private)'},
		{code: 'rented_social', label: 'rented (social)'},
		{code: 'rent_free', label: 'rent free'}
	],
	travel: [
		{code: "train_metro", label: "train/metro"},
		{code: "bus"},
		{code: "taxi"},
		{code: "car_van", label: "car/van"},
		{code: "moto", label: "motorbike/scooter"},
		{code: "bicycle"},
		{code: "foot", label: "on foot"},
		{code: "home", label: "home worker"},
		{code: "other"}
	]
};