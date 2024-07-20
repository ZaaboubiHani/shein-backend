const Client = require('../models/client')
const Customer = require('../models/customer')
const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')
const bwipjs = require('bwip-js')

// Function to generate barcode image buffer
async function generateBarcodeImage(barcode) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'ean13',
        text: barcode,
        scale: 2,
        height: 10,
      },
      (err, png) => {
        if (err) {
          reject(err)
        } else {
          resolve(png)
        }
      }
    )
  })
}

// Function to generate a random barcode
function generateRandomBarcode() {
  const firstDigit = Math.floor(Math.random() * 9) + 1 // Ensure first digit is between 1 and 9
  const number =
    firstDigit.toString() +
    Array.from(
      { length: 11 },
      () => Math.floor(Math.random() * 10).toString() // Generate remaining digits from 0 to 9
    ).join('')
  return number + getChecksum(number)
}

// Function to calculate checksum for the barcode
function getChecksum(number) {
  const digits = number.split('').map(Number)
  const sum = digits.reduce(
    (acc, digit, idx) => acc + digit * (idx % 2 === 0 ? 1 : 3),
    0
  )
  return (10 - (sum % 10)) % 10
}

// Function to draw the barcode on the image
async function generateImageWithBarcode(imagePath, barcodeImage, outputPath) {
  const canvas = createCanvas(1280, 825) // Create a canvas with the size of the image
  const ctx = canvas.getContext('2d')

  const image = await loadImage(imagePath) // Load the uploaded image
  ctx.drawImage(image, 0, 0) // Draw the uploaded image onto the canvas

  // Draw the barcode onto the canvas
  const barcode = await loadImage(barcodeImage)
  ctx.drawImage(
    barcode,
    (canvas.width - 500) / 2,
    (canvas.height - 150) / 2 + 80,
    500,
    150
  )

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer) // Save the canvas as an image
}

const createClients = async (req, res) => {
  try {
    console.log(req.body)
    const { numberOfClients, savePath } = req.body
    const clients = []

    // Generate all clients and their barcodes first
    for (let i = 0; i < numberOfClients; i++) {
      const barcode = generateRandomBarcode()
      const newClient = new Client({ barcode })
      await newClient.save()
      clients.push(newClient)
    }

    // Generate barcodes images
    const barcodeImages = await Promise.all(
      clients.map((client) => generateBarcodeImage(client.barcode))
    )

    const imagePath = path.join(__dirname, 'card.jpg')
    const outputDir = savePath

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true }) // Create the directory recursively
    }

    // Generate and save images with barcodes
    await Promise.all(
      clients.map((client, index) => {
        const outputPath = path.join(outputDir, `${client.barcode}.png`)
        return generateImageWithBarcode(
          imagePath,
          barcodeImages[index],
          outputPath
        )
      })
    )

    res.status(200).json({
      success: true,
      message: 'Images generated and saved successfully.',
    })
  } catch (error) {
    res.status(500).json({ error: 'Error creating Clients' })
    console.error(error)
  }
}

const getOneClient = async (req, res) => {
  const queryParam = req.query.barcode

  try {
    let client = await Client.findOne({ barcode: queryParam })

    if (!client) {
      client = await Customer.findOne({ phone: queryParam })
    }

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    res.status(200).json(client)
  } catch (error) {
    res.status(500).json({ error: 'Error getting Client' })
    console.error(error)
  }
}

const getOneCustomer = async (req, res) => {
  const queryParam = req.query.barcode

  try {
    let client = await Customer.findOne({ barcode: queryParam })

    if (!client) {
      client = await Customer.findOne({ phone: queryParam })
    }

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    res.status(200).json(client)
  } catch (error) {
    res.status(500).json({ error: 'Error getting Client' })
    console.error(error)
  }
}

const updateClient = async (req, res) => {
  const clientId = req.params.id
  try {
    const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, {
      new: true,
    })

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' })
    }

    res.status(200).json(updatedClient)
  } catch (error) {
    res.status(500).json({ error: 'Error updating Client' })
  }
}

module.exports = {
  createClients,
  getOneClient,
  updateClient,
  getOneCustomer,
}
