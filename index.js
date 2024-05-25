// Require the express web application framework (https://expressjs.com)
const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('myDB');
// Create a new web application by calling the express function
const app = express()
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }));
// Tell our application to serve all the files under the `public_html` directory
app.use(express.static('public_html'))
app.post('/signup', (req,res) => {
  const { name, email, password } = req.body;
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS users (name TEXT, email TEXT, password TEXT)");
        db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, password], function(err) {
                if (err) {
                    console.error(err.message);
                    res.status(500).send("An error occurred while saving the data.");
                    return;
                }
                db.each("SELECT * FROM users", function(err, row) {
                    if (err) {
                        console.error(err.message);
                        return;
                    }
                    console.log("Name: " + row.name + "  email: " + row.email + "  password: " + row.password );
                });
            });
    });
    res.send(200, 'Data Saved Successfully');
})

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  db.serialize(function () {
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], function (err, row) {
      if (err) {
        console.error(err.message);
        res.status(500).send("An error occurred while retrieving the data.");
        return;
      }
      if (row) {
        res.status(200).json({ message: "Sign in successful!", name: row.name });
      } else {
        res.status(401).send("Invalid email or password.");
      }
    });
  });
});
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public_html', '404.html'));
});
// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, ()=> {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000. Print another message indicating
  // how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`)
  console.log(`Type Ctrl+C to shut down the web server`)
})
