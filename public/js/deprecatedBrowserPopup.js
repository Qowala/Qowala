// Check if browser version is recent enough
try {
  var promise = new Promise(function(){
  });
} catch (error) {
  var popup = document.getElementById('deprecatedBrowserPopup');
  popup.style.display = 'block';
}
