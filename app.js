const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const { MongoClient } = require('mongodb');



const app = express();
const port = 3000;

// Configure Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
 secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
})); 
app.use(express.static(__dirname + '/views'));

// MongoDB connection URL and database name
const url = 'mongodb+srv://gsriniketh:veaU4DtFrkm7cKEc@users.7lgxoju.mongodb.net/library_management';
const dbName = 'library_management';
// Routes
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});

app.post('/signup', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password !== confirmPassword) {
    return res.send('<script>alert("Passwords do not match!"); window.location.href = "/signup";</script>');
  }

  try {
    const client = new MongoClient(url);
    await client.connect();

    const db = client.db(dbName);

    // Check if the username already exists
    const user = await db.collection('users').findOne({ username: username });
    if (user) {
      return res.send('<script>alert("Username already exists. Please choose a different username."); window.location.href = "/signup";</script>');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password,10);

    // Insert the new user into the database
    await db.collection('users').insertOne({ username: username, password: hashedPassword });
    //return res.send('<script>alert("Signup successful."); window.location.href = "/success";</script>');
    res.sendFile(__dirname + '/views/booklist.html');
    client.close();
  } catch (err) {
    console.log(err);
    return res.send('<script>alert("An error occurred."); window.location.href = "/signup";</script>');
  }
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    try {
      const client = new MongoClient(url);
      await client.connect();
  
      const db = client.db(dbName);
  
      // Retrieve the user from the database
      const user = await db.collection('users').findOne({ username: username });
      if (!user) {
        return res.send('<script>alert("Invalid username or password. Please try again."); window.location.href = "/";</script>');
      }
  
      // Print the stored password hash
      //console.log('Stored Password Hash:', user.password);
  
      // Compare the entered password with the stored hashed password
      const match = await bcrypt.compare(password, user.password);
  
      // Print the result of the comparison
      //console.log('Password Match:', match);
  
      if (match) {
        // Set the user's session
        req.session.user = user.username;
       // return res.redirect('/success');
       res.sendFile(__dirname + '/views/booklist.html');
      } else {
        return res.send('<script>alert("Invalid username or password. Please try again."); window.location.href = "/";</script>');
      }
  
      client.close();
    } catch (err) {
      console.log(err);
     return res.send('<script>alert("An error occurred."); window.location.href = "/";</script>');
     

    }
  });
  

app.get('/success', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  res.sendFile(__dirname + '/views/success.html');
});





// Sample book data
const books = [
  // Previous books...
  {
    id: 1,
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    year: 1998,
    availabilityStatus: 'Available',
    numAvailableCopies: 5
  },
  {
    id: 2,
    title: 'Harry Potter and the Prisoner of Azkaban',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    year: 1999,
    availabilityStatus: 'Available',
    numAvailableCopies: 3
  },
  {
    id: 3,
    title: 'Harry Potter and the Goblet of Fire',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    year: 2000,
    availabilityStatus: 'Available',
    numAvailableCopies: 2
  },
  {
    id: 4,
    title: 'Harry Potter and the Order of the Phoenix',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    year: 2003,
    availabilityStatus: 'Available',
    numAvailableCopies: 4
  },
  {
    id: 5,
    title: 'Harry Potter and the Half-Blood Prince',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    year: 2005,
    availabilityStatus: 'Available',
    numAvailableCopies: 0
  },
  {
    id: 6,
    title: 'Harry Potter and the Deathly Hallows',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    year: 2007,
    availabilityStatus: 'Available',
    numAvailableCopies: 3
  },
  {
    id: 7,
    title: 'Fantastic Beasts and Where to Find Them',
    author: 'Newt Scamander',
    genre: 'Fantasy',
    year: 2001,
    availabilityStatus: 'Available',
    numAvailableCopies: 2
  },
  {
    id: 8,
    title: 'Quidditch Through the Ages',
    author: 'Kennilworthy Whisp',
    genre: 'Fantasy',
    year: 2001,
    availabilityStatus: 'Available',
    numAvailableCopies: 4
  },
  {
    id: 9,
    title: 'The Tales of Beedle the Bard',
    author: 'Beedle the Bard',
    genre: 'Fantasy',
    year: 2008,
    availabilityStatus: 'Available',
    numAvailableCopies: 2
  },
  {
    id: 10,
    title: 'Harry Potter and the Cursed Child',
    author: 'J.K. Rowling, John Tiffany, Jack Thorne',
    genre: 'Fantasy',
    year: 2016,
    availabilityStatus: 'Available',
    numAvailableCopies: 3
  },
  // Add more books here...
];

  
  // Add more books here...





app.get('/api/books', (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const perPage = 10; // Number of books per page
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  const searchQuery = req.query.search || ''; // Search query
  const filter = req.query.filter || ''; // Filter option

  // Filter and sort books based on the filter option
  let filteredBooks = books.filter(book => {
    const titleMatch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const genreMatch = book.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const yearMatch = book.year.toString().includes(searchQuery);

    return titleMatch || authorMatch || genreMatch || yearMatch;
  });

  switch (filter) {
    case 'title':
      filteredBooks = filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'author':
      filteredBooks = filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case 'subject':
      filteredBooks = filteredBooks.sort((a, b) => a.genre.localeCompare(b.genre));
      break;
    case 'publish-date':
      filteredBooks = filteredBooks.sort((a, b) => a.year - b.year);
      break;
    default:
      break;
  }

  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
  const hasMore = endIndex < filteredBooks.length;

  // Get suggestions based on the search query
  const suggestions = books.filter(book => {
    const titleMatch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const genreMatch = book.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const yearMatch = book.year.toString().includes(searchQuery);

    return titleMatch || authorMatch || genreMatch || yearMatch;
  }).map(book => `${book.title}`);

  // Update book objects with availability status and number of available copies
  const booksWithAvailability = paginatedBooks.map(book => {
    const availabilityStatus = book.numAvailableCopies > 0 ? 'Available' : 'Unavailable';
    const numAvailableCopies =  getNumAvailableCopies(book.id);
    return { ...book, availabilityStatus, numAvailableCopies };
  });

  const count = filteredBooks.length;

  res.json({ books: booksWithAvailability, hasMore, suggestions, count });
});








// Function to get the availability status for a book
function getAvailabilityStatus(bookId) {
  const book = books.find((book) => book.id === bookId);
  return book ? book.availabilityStatus : null;
}

// Function to get the number of available copies for a book
function getNumAvailableCopies(bookId) {
  const book = books.find((book) => book.id === bookId);
  return book ? book.numAvailableCopies : null;
}


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`http://localhost:3000`);
});
