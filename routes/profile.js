const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('../config');
const userData = require('../models/user');
const jwt = require('jsonwebtoken');