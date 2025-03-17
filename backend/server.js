const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const testRoutes = require('./routes/testRoutes');
const astigRoutes = require('./routes/astigRoutes')
const colorRoutes = require('./routes/colorBlindnessRoutes')
const scheduler = require("./config/scheduler"); 
const faceRoutes = require('./routes/faceShapeRoutes');
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use("/admin", adminRoutes); 
app.use("/users", userRoutes); 
app.use("/reviews", reviewRoutes);
app.use("/test", testRoutes);
app.use("/astigmatism", astigRoutes);
app.use("/face-shape", faceRoutes);
app.use("/color-blindness", colorRoutes);

app.get('/', (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
