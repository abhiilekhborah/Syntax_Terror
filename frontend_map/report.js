let lat;
let lng;

const params =
new URLSearchParams(window.location.search);

lat = params.get("lat");
lng = params.get("lng");

document.getElementById("location").innerText =
"Location: " + lat + ", " + lng;

function submitReport(){

let issue =
document.getElementById("issueType").value;

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
address:"Map Selected Location",
description:issue + " : " + description

})

})
.then(res=>res.json())
.then(data=>{

alert("Report submitted");

window.location.href="map.html";

});

}