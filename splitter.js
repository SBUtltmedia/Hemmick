// Imports
const fs = require('fs');
const csv = require('csv-parser');
const {
    spawn
} = require('child_process');
const process = require('process');

// Should debug statements be printed?
const debug = false;

// Get video number from command line
const videoNumber = process.argv[2];

// Hold where files should be stored
// In the lab, this should probably look like
// `/Volumes/tll/Local/Users/NETID/${process.argv[3]}_Hemmick_Lectures/`
var basePath = `/home/danwaxman/devel/Work/Hemmick/${process.argv[3]}_Hemmick_Lectures/`;
var SplitFolders = basePath + "SplitFolders";
var SourceLectures = basePath + "SourceLectures";

var csvName = `csv/${process.argv[3]}/${videoNumber}.csv`;
var index = 0;
var runFfmpeg = true;

// Take each row from CSV, parse, and create new video.
fs.createReadStream(csvName)
    .pipe(csv())
    .on('data',
        (row) => {
            index++;
            makenewVideo(row);
        })
    .on('end', function() {
        console.log("Finished processing.");
    });

/**
 * Take some time in and output the equivalent number of seconds.
 * 
 * @param {String} time in "mm:ss.dd" format
 * @returns {number} time in seconds
 */
function toSeconds(atime) {

    var mm = parseInt(atime.split(":")[0]);
    var ss = parseInt(atime.split(".")[0].split(":")[1]);
    var deciseconds = parseInt(atime.split(".")[1]) || 0;

    return mm * 60 + ss + deciseconds / 100;
}

/**
 * Create new video based on a row of splitting data.
 * 
 * @param {Object} Row data from CSV  
 */
function makenewVideo(row) {
    // Video numbers should be padded (i.e. Lecture##.mp4)
    fileName = `Lecture${videoNumber.padStart(2, '0')}.mp4`;
    // Elements of row should include 'Topic', 'Subtopic', 'Filename', 'Video Start Time', and 'Video End Time'
    if (debug) console.log(row);

    var recompress = ['-codec', 'copy'];
    var startTimeSeconds = toSeconds(row['Video Start Time']);
    var endTimeSeconds = toSeconds(row['Video End Time']);
    if (row['recompress']) {
        recompress = ['-vcodec', 'libx264'];
        console.log("recompressing", ...recompress);
    }

    // Output filename
    var currentVideo = `${SplitFolders}/${row['Topic']}/${row['Subtopic']}`;

    // Create new video in filesystem
    fs.mkdir(currentVideo, {
        recursive: true
    }, (err) => {
        if (err) {
            throw err;
        } else {
            // Have FFmpeg split videos.
            if (runFfmpeg) {
                var outFile = `${currentVideo}/${row['Filename']}.mp4`.replace(" ", "\ ")
                const ffmpeg = spawn('ffmpeg', ['-y', '-i', `${SourceLectures}/${fileName}`, '-ss', `${startTimeSeconds}`, '-to', `${endTimeSeconds}`, ...recompress, outFile]);
                ffmpeg.stdout.on('data', (data) => {
                    //  console.log(`stdout: ${data}`);
                });

                ffmpeg.stderr.on('data', (data) => {
                    if (debug) console.log(`stderr: ${data}`);
                });

                ffmpeg.on('close', (code) => {
                    if (debug) console.log(`child process exited with code ${code}`);
                });
            }
        }
    })
}