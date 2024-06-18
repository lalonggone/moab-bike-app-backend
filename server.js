const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    })
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret')
    res.status(201).json({ user, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

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

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get a user by email
app.get('/users/:email', async (req, res) => {
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
app.put('/users/:email', async (req, res) => {
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
app.delete('/users/:email', async (req, res) => {
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
