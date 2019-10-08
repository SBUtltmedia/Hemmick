
const fs = require('fs');
const csv = require('csv-parser');
var TimeFormat = require('hh-mm-ss')
const { spawn } = require('child_process')
const process = require('process');
const videoNumber=process.argv[2];
var VideoFolders ="SplitFolders";
// var startTime = '00:02:20';
// var endTime = '00:06:13';

var csvName = `${videoNumber}.csv`
var index = 0;
var runFfmpeg=true;
fs.createReadStream(csvName)
    .pipe(csv())
    .on('data',
        (row) => {
          index++;
          makenewVideo(row);
        })
    .on('end', function() {
      // some final operation
    });

function toSeconds(atime) {
  return parseInt(atime.split(":")[0]) * 60 + parseInt(atime.split(":")[1])
}

function makenewVideo(row) {

  fileName= `Lecture${videoNumber.padStart(2, '0')}.mp4`
//row['Topic'], row['Subtopic'],row['Filename'], row['Video Start Time'],  row['Video End Time']
  fs.readFile(fileName, "utf8", function read(err, contents) {

    var startTimeSeconds = toSeconds(row['Video Start Time'])
    var endTimeSeconds = toSeconds(row['Video End Time'])



    var currentVideo = `${VideoFolders}/${row['Topic']}/${row['Subtopic']}`




	fs.mkdir(currentVideo, {recursive : true}, (err) => {
      if (err) {
        throw err;
      } else {
        if (runFfmpeg){
        var outFile=  `${currentVideo}/${row['Filename']}.mp4`.replace(" ","\ ")
        const ffmpeg = spawn('ffmpeg', ['-y','-i', `${fileName}`,'-ss', `${startTimeSeconds}`, '-to', `${endTimeSeconds}`,'-codec','copy' ,outFile]);
        ffmpeg.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });

        ffmpeg.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        });

        ffmpeg.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
        });
}
      //  const copyDir = spawn('cp', ["-a", "resources/*",currentVideo]);




      }
    });
  })
}

//   .then(function(myJson) {
//
//     for (i = 0; i <myJson.questions.length;i++){
//
//     var currentTime = myJson.questions[i].startTime
//
// if (currentTime >= startTimeSeconds && currentTime <= endTimeSeconds){
// console.log(currentTime)
//   myJson.questions[i].startTime = currentTime - startTime
// }
//
//
//     }
//
//   console.log(myJson);
//
//   });
