const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(__dirname + '/dist/seafood-project-inputer'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname +
        '/dist/seafood-project-inputer/index.html'));
});
console.log(`RUN AT http://localhost:${process.env.PORT || 8080}`)
app.listen(process.env.PORT || 8080);
