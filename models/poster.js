const mongoose = require("mongoose");

const posterSchema = new mongoose.Schema(
  {
    url: 
      {
        type: String,
        get: (url) => {
          const baseUrl = process.env.BASE_URL;
          return baseUrl + url;
        },
      },
  },
  { timestamps: true, versionKey: false, toJSON: { getters: true }, id: false }
);

const Poster = mongoose.model("Poster", posterSchema);

module.exports = Poster;
