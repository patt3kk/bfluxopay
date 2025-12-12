require("dotenv").config();
const express = require ("express");
const { config } = require("./config");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middlewares/error.middleware");

// Configure CORS with credentials - include the correct origin for production and development
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:8000", "https://opay.xo.je"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests for all routes
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Add logging for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path} from ${req.get('Origin')}`);
  next();
});

app.use("/api/v1/status", (req, res) =>{
    // console.log(req)
    res.send(`yes! welcome to ${config.APPNAME}API`);
})
app.use(errorHandler)

module.exports = app;