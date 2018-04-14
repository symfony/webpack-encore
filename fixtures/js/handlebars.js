var template = require('../templates/template.hbs');

document.getElementById('app').innerHTML = template({
    title: 'Welcome to Your Handlebars App'
});
