import dayjs from "dayjs";

var createTimeTittle = (ts) => {
	var now = parseInt((Date.now() - ts) / 1000);

	if (now == 0) return "just now";

	if (now < 60) return `${now} seconds ago`;

	if (now < 60 * 60) return `${Math.floor(now / 60)} minutes ago`;

	if (now < 60 * 60 * 24) return `${Math.floor(now / 60 / 60)} hours ago`;

	if (now < 60 * 60 * 24 * 365) return `${Math.floor(now / 60 / 24 / 60)} days ago`;

	return "so long";
};

var format = (arr) => {
	var res = [];
	for (let i = 0; i < arr.length; i++) {
		res.push({ ...arr[i], date: createTimeTittle(arr[i].time) });
	}
	return res;
};

export { format, createTimeTittle };
