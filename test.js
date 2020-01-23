var x = JSON.parse('{"team = ": "sla"}', (key, value) => {
//var x = JSON.parse('[{"team = ": "sla"}, {"gameDate < ": "2018-12-03"}]', (key, value) => {
  return value;
});

for(var idx in x) {
  var item = x[idx];
  for (var key in item) {
    var value = item[key];
    console.log(key, value);
  }
}
