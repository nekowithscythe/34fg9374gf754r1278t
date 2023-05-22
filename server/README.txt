Environment Variables accepted by the server

PORT: the port on localhost the server will accept connections from. default:3001

MAX_FILE_SIZE: the max filesize that the server will accept in bytes. default: 500000000
The default is so high is because for a local host demo, if the file size is too small, it would be hard to showcase
the upload progress bar.

UPLOAD_PATH: the part to upload to. default: ./uploads
Be sure to create the path before starting the server.

CORS_WHITELIST: the url to whitelist for CORS, need when running REACTJS as a separate server in development mode.
default: "http://localhost:" + PORT

SIMULATE_ERRORS: set to anything other than 'no' to get the server to return errors on it's API calls. 
For use during demo to show case error handling.


Modules:
server@1.0.0 /home/technie/projects/govtech/videoupload-challenge/v01/server
├── body-parser@1.20.2
├── cors@2.8.5
├── express@4.18.2
├── multer@1.4.5-lts.1
├── nodemon@2.0.22
└── sqlite3@5.1.6