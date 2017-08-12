var hamburger = document.querySelector('#hamburger');
var sidebar = document.querySelector('#sidebar');

hamburger.onclick = function() {
    sidebar.className = (sidebar.className == 'close') ? 'open' : 'close';
};

