
const fs = require('fs');
const csv = require('csv-parser');
const { spawn } = require('child_process')
const process = require('process');
const videoNumber=process.argv[2];
var basePath=`/Volumes/tll/Local/Users/evannieuwenh/${process.argv[3]}_Hemmick_Lectures/`;
var SplitFolders =basePath+"SplitFolders";
var SourceLectures =basePath+"SourceLectures";
// var startTime = '00:02:20';
// var endTime = '00:06:13';

var csvName = `csv/${process.argv[3]}/${videoNumber}.csv`
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

var mm =parseInt(atime.split(":")[0]);
var ss =parseInt(atime.split(".")[0].split(":")[1]);
var deciseconds =parseInt(atime.split(".")[1])||0;

  return mm * 60 + ss +deciseconds/100;
}

function makenewVideo(row) {

  fileName= `Lecture${videoNumber.padStart(2, '0')}.mp4`
//row['Topic'], row['Subtopic'],row['Filename'], row['Video Start Time'],  row['Video End Time']
  console.log(row)
    var recompress=['-codec','copy'];;
    var startTimeSeconds = toSeconds(row['Video Start Time'])
    var endTimeSeconds = toSeconds(row['Video End Time'])
    if(row['recompress']) {
      recompress =['-vcodec','libx264'];
      console.log("recompressing",...recompress)
    }




    var currentVideo = `${SplitFolders}/${row['Topic']}/${row['Subtopic']}`




	fs.mkdir(currentVideo, {recursive : true}, (err) => {
      if (err) {
        throw err;
      } else {
        if (runFfmpeg){
        var outFile=  `${currentVideo}/${row['Filename']}.mp4`.replace(" ","\ ")
        const ffmpeg = spawn('ffmpeg', ['-y','-i', `${SourceLectures}/${fileName}`,'-ss', `${startTimeSeconds}`, '-to', `${endTimeSeconds}`,...recompress ,outFile]);
        ffmpeg.stdout.on('data', (data) => {
        //  console.log(`stdout: ${data}`);
        });

        ffmpeg.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        });

        ffmpeg.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
        });
}





      }
  })
}
