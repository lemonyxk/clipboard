// var a = [1, 2, 3];

// a.splice(1, 1);

// console.log(a);

// console.log(new Date().toISOString());

var obj = {
	log: function () {},
};

obj.log = function () {
	console.log(obj.log.caller.name);
};

function test() {
	obj.log();
}

console.log(test());
