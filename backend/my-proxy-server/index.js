const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); 

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Store the last successfully processed file name
let lastProcessedFile = null;

app.post('/proxy/slipok', upload.single('file'), async (req, res) => {
  try {
    const { log, amount } = req.body;

    // Check if the file has already been processed
    if (req.file && req.file.filename === lastProcessedFile) {
      console.log("This file has already been processed.");
      res.status(200).json({ message: "This file has already been processed." });
      return;
    }

    const formData = new FormData();
    if (req.file) {
      formData.append("files", fs.createReadStream(req.file.path)); // File upload option
    }

    // Adding either a file, data (QR code string), or URL to the form data
    formData.append("log", log || false);
    if (amount) {
      formData.append("amount", amount); // Optional amount check
    }

    const response = await axios.post('https://api.slipok.com/api/line/apikey/', formData, { //api key
      headers: {
        "x-authorization": "", //api key
        ...formData.getHeaders(),
      },
    });

    console.log("HTTP Status:", response.status);

    if (response.status === 200 || response.status === 400) {
      // Update the last processed file name only if status is 200 or 400
      if (req.file) {
        lastProcessedFile = req.file.filename;
      }
      res.json(response.data);
    } else {
      // If status is not 200 or 400, allow reprocessing of the same file
      console.log("Received unexpected status. File can be reprocessed.");
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error("Error during API request:", error);
    // Adding detailed error response data for debugging
    if (error.response) {
      console.error("Response data:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path); // Delete the uploaded file after processing
    }
  }
});

app.listen(3000, () => console.log('Proxy server is running on port 3000'));
