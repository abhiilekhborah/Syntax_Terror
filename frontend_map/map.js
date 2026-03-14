let map;
let lat;
let lng;

navigator.geolocation.getCurrentPosition(function(position){

lat = position.coords.latitude;
lng = position.coords.longitude;

map = L.map('map').setView([lat,lng], 15);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:19
}).addTo(map);

L.marker([lat,lng]).addTo(map);

});

function goToReport(){

window.location.href =
`report.html?lat=${lat}&lng=${lng}`;

}