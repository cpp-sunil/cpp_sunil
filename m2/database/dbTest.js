const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/m2_module', (err, result) => {
    if (err) { console.log('Database connection error') }
    else { console.log("Database connected Successfully") }
})
