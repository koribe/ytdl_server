const express = require("express");
const fs = require("fs");
const ytdl = require("ytdl-core");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());

app.get("/download", function (req, res) {
  if (ytdl.validateURL(req.query.videoUrl)) {
    let videoUrl = req.query.videoUrl;
    let destDir = "temp/";

    let videoReadableStream = ytdl(videoUrl, {
      filter: "audioonly",
      format: "highestaudio",
    })
      .on("error", (err) => {
        console.log("Nem letezik a video vagy nem nyilvanos -" + err);
        res.send("Nem létezik a videó vagy nem nyilvános -" + err);
      })
      .on("info", (info) => {
        let videoName = info.videoDetails.title
          .replace("|", "")
          .toString("ascii");
        let fileName = videoName + ".mp3";
        let videoWritableStream = fs.createWriteStream(destDir + fileName);

        let stream = videoReadableStream.pipe(videoWritableStream);

        stream.on("finish", function () {
          let options = {
            headers: {
              "Access-Control-Expose-Headers": "Content-Disposition", //Needed to send the filename
            },
          };
          res.download(destDir + fileName, fileName, options, function (err) {
            if (err) {
              console.log("Szerver hiba -" + err);
            }

            //The server logs when the donwload started
            let today = new Date();
            let time =
              today.getHours() +
              ":" +
              today.getMinutes() +
              ":" +
              today.getSeconds();
            console.log(`Sikeres letoltes : ${time}`);

            fs.unlinkSync(destDir + fileName); //Delete the file when download finished
          });
        });
      });
  } else {
    console.log("Hianyzo vagy hibas URL");
    res.send("Hiányzó vagy hibás URL");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
