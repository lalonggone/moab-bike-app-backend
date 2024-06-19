const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const verifyToken = require('./verifyToken');
const { auth } = require('./firebaseAdmin');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      account_type: req.body.account_type
    });
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret');
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login a user
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret');
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Google Sign-In
app.post('/google-signin', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received Google ID Token:', token);
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Decoded Token:', decodedToken);

    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        uid, // Note: Make sure `uid` column exists in the model if using this field
        email,
        name,
        profile_picture: picture,
        account_type: 'individual', // Default value for Google sign-ins
        role: 'user' // Default value for Google sign-ins
      });
      console.log('New User Created:', user);
    } else {
      console.log('User Already Exists:', user);
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in Google Sign-In:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Example of a protected route
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Create a new user
app.post('/users', verifyToken, async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all users
app.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get a user by email
app.get('/users/:email', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.params.email } })
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update user bio
app.put('/users/:email', verifyToken, async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { email: req.params.email },
    })
    if (updated) {
      const updatedUser = await User.findOne({
        where: { email: req.params.email },
      })
      res.json(updatedUser)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete a user
app.delete('/users/:email', verifyToken, async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { email: req.params.email } })
    if (deleted) {
      res.status(204).json()
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})