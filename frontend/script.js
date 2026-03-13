let map;
let marker;
let lat;
let lng;

navigator.geolocation.getCurrentPosition(function(position){

lat = position.coords.latitude;
lng = position.coords.longitude;

map = L.map('map').setView([lat, lng], 15);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom: 19
}).addTo(map);

marker = L.marker([lat, lng], { draggable:true }).addTo(map);

marker.on("dragend", function(e){

let pos = marker.getLatLng();

lat = pos.lat;
lng = pos.lng;

});

});

function submitReport(){

let description =
document.getElementById("description").value;

fetch("http://127.0.0.1:5000/report",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

latitude:lat,
longitude:lng,
address:"Selected location",
description:description

})

})
.then(res=>res.json())
.then(data=>{

alert("Report submitted successfully");

});

}