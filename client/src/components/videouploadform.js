import { useState, useEffect } from "react";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Table from 'react-bootstrap/Table';

import axios from "axios";

function VideoUploadForm({ upload_api_path }) {

    const [formState, setFormState] = useState("form");      
    
    const [fileTitle, setFileTitle] = useState("");
    const [fileDateTime, setFileDateTime] = useState("");
    const [fileLocation, setFileLocation] = useState("");
    const [fileVideo, setFileVideo] = useState(undefined);
    const [tocAccept, setTocAccept] = useState(false);
    
    const [fileTitleNotValid, setFileTitleNotValid] = useState(null);
    const [fileDateTimeNotValid, setFileDateTimeNotValid] = useState(null);
    const [fileLocationNotValid, setFileLocationNotValid] = useState(null);
    const [fileVideoNotValid, setFileVideoNotValid] = useState(false);
    const [mustAcceptToc, setMustAcceptTOC] = useState(null);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadErrors, setUploadErrors] = useState([]);

    const [videoMetadata, setVideoMetadata] = useState({
        duration: 0,
        width: 0,
        height: 0
    });

    const [thumbnailImage, setThumbnailImage] = useState(null);

    const handleReset = (e) => {
        e.preventDefault();

        setFileTitle("");
        setFileDateTime("");
        setFileLocation("");
        setFileVideo(undefined);
        setFileTitleNotValid(null);
        setFileDateTimeNotValid(null);
        setFileLocationNotValid(null);
        setFileVideoNotValid(false);
        setThumbnailImage(null);
        setTocAccept(false);


        var o_fileform = document.getElementById("upload_form");
        if (o_fileform !== null) {
            o_fileform.reset();
        }
        var o_tocform = document.getElementById("toc_form");
        if (o_tocform !== null) {
            o_tocform.reset();
        }
        var o_tocaccept = document.getElementById("toc_accepted");
        if (o_tocaccept !== null) {
            //console.log("o_tocaccept.checked = false");
            o_tocaccept.checked = false;
        }

        setUploadProgress(0);
        setFormState("form");
    };

    const handleRetry = (e) => {
        e.preventDefault();

        setTocAccept(false);
        setMustAcceptTOC(null);

        var o_tocform = document.getElementById("toc_form");
        if (o_tocform !== null) {
            o_tocform.reset();
        }
        var o_tocaccept = document.getElementById("toc_accepted");
        if (o_tocaccept !== null) {
            //console.log("o_tocaccept.checked = false");
            o_tocaccept.checked = false;
        }

        setUploadProgress(0);
        setFormState("form");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let formvalid = true;
        let formData = new FormData();

        if (fileTitle.length > 0) {
            if (fileTitleNotValid === null) {
                formData.append("file_title", fileTitle);
            } else {
                formvalid = false;
            }
        } else {
            setFileTitleNotValid("Title must be between 8 and 100 characters long.");
            formvalid = false;
        }

        if (checkDateTime(fileDateTime)) {
            formData.append("file_datetime", fileDateTime);
        } else {
            formvalid = false;
            setFileDateTimeNotValid("Please use the date picker for the date and time.");
        }

        if (fileLocation.length > 0) {
            if (fileLocationNotValid === null) {
                formData.append("file_location", fileLocation);
            } else {
                formvalid = false;
            }
        } else {
            formData.append("file_location", "");
        }
        
        if (fileVideo === undefined) {
            formvalid = false;
            setFileVideoNotValid("Please choose a valid video file.");
        } else if (fileVideo.type.includes("video")) {
            formData.append("file_video", fileVideo);
        } else {
            formvalid = false;
            setFileVideoNotValid("File must be a video file.");
        }
        
        if (videoMetadata && videoMetadata.duration && videoMetadata.duration > 0) {
            formData.append("file_duration", Math.floor(videoMetadata.duration));
        } else {
            formData.append("file_duration", 0);
        }
        
        if (tocAccept) {
            setMustAcceptTOC(null);
        } else {
            setMustAcceptTOC("You need to accept the Terms and Conditions.");
            formvalid = false;
        }

        if (formvalid) {
            setFormState("upload");
            axios.post(upload_api_path, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    let percent = Math.floor((loaded * 100) / total);
                    //console.log(`${loaded}kb of ${total}kb | ${percent}%`);

                    if (percent < 100) {
                        setUploadProgress(percent);
                    } else {
                        setUploadProgress(100);
                    }
                }
            }).then((res) => {
                //console.log("res: ", res);
                setTimeout(() => {
                    setFormState("upload_completed");
                }, 1000);
            }).catch((err) => {
                //console.log("err: ", err);
                setTimeout(() => {
                    setUploadErrors(err.response.data.errors);
                    setFormState("upload_failed");
                }, 1000);
            });
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        let formvalid = true;

        if (fileTitle.length > 0) {
            if (fileTitleNotValid === null) {
            } else {
                formvalid = false;
            }
        } else {
            setFileTitleNotValid("Title must be between 8 and 100 characters long.");
            formvalid = false;
        }

        if (checkDateTime(fileDateTime)) {
        } else {
            formvalid = false;
            setFileDateTimeNotValid("Please use the date picker for the date and time.");
        }

        if (fileLocation.length > 0) {
            if (fileLocationNotValid === null) {
            } else {
                formvalid = false;
            }
        }
        
        if (fileVideo === undefined) {
            formvalid = false;
            setFileVideoNotValid("Please choose a valid video file.");
        } else if (fileVideo.type.includes("video")) {
        } else {
            formvalid = false;
            setFileVideoNotValid("File must be a video file.");
        }
        
        if (formvalid) {
            setFormState("toc");
        }
    };

    const handleTOC = (v) => {
        //e.preventDefault();
        //console.log("TOC: ", v);

        if (v) {
            setMustAcceptTOC(null);
        }

        setTocAccept(v);
    };

    const handleFileTitle = (v) => {
        //e.preventDefault();
        v = v.trim();
        if (v.length < 1) {
            setFileTitleNotValid("Title must be between 8 and 100 characters long.");
        } else if (v.length < 8) {
            setFileTitleNotValid("Title must be between 8 and 100 characters long.");
        } else if (v.length > 100) {
            setFileTitleNotValid("Title must be between 8 and 100 characters long.");
        } else {
            setFileTitleNotValid(null);
            setFileTitle(v);
        }
    };

    function checkDateTime(v) {
        //Source: https://stackoverflow.com/a/3143231
        var dateregex = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)$/;
        var matchdata = v.trim().match(dateregex);
        if (matchdata) {
            return true;
        } else {
            return false;
        }
    }
    const handleFileDateTime = (v) => {
        //e.preventDefault();
        v = v.trim();
        if (checkDateTime(v)) {
            setFileDateTimeNotValid(null);
            setFileDateTime(v);
        } else {
            setFileDateTimeNotValid("Please use the date picker for the date and time.");
        }
    };

    function checkLocation(v) {
        var intregex = /^(\d{6})$/;
        var matchdata = v.trim().match(intregex);
        if (matchdata) {
            return true;
        } else {
            return false;
        }
    }
    const handleFileLocation = (v) => {
        //e.preventDefault();
        v = v.trim();
        if (v.length > 0) {
            if (checkLocation(v)) {
                setFileLocationNotValid(null);
                setFileLocation(v);
            } else {
                setFileLocationNotValid("Location, if specified must be 6 digits long.");
            }
        } else {
            setFileLocationNotValid(null);
            setFileLocation("");
        }
    };

    const handleFileVideo = (v) => {
        //e.preventDefault();
        //console.log("handleFileVideo: ", v);
        if (v.type.includes("video")) {
            getVideoThumbnail(v, 0.5).then((thumbnail) => {
                //console.log("thumbnail: ", thumbnail);
                setThumbnailImage(thumbnail);
            });
            getVideoMedaData(v).then((duration) => {
                //console.log("duration: ", duration);
                setVideoMetadata(duration);
            });
            setFileVideo(v)
            setFileVideoNotValid(null);
        } else {
            setFileVideoNotValid("File must be a video file.");
            setFileVideo(undefined);
        }
    };

    return (
        <>
            <Container style={{ display: (formState=="form") ? "block" : "none" }}>
            <h1>Upload Video</h1>
                <Row>
                
                    <Col sm={8}>
                        <Form 
                            action="/api/upload"
                            method="post"
                            encType="multipart/form-data"
                            onSubmit={handleNext}
                            id="upload_form"
                        >
                            <Form.Group controlId="formTitle" className="mb-3">
                                <Form.Label>Title</Form.Label>
                                { fileTitleNotValid ? <Alert variant="warning">{fileTitleNotValid}</Alert> : null }
                                <Form.Control 
                                    type="text"
                                    name="file_title" 
                                    onChange={(e) => {handleFileTitle(e.target.value)}}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formDateTime" className="mb-3">
                                <Form.Label>Date and Time</Form.Label>
                                { fileDateTimeNotValid ? <Alert variant="warning">{fileDateTimeNotValid}</Alert> : null }
                                <Form.Control 
                                    type="datetime-local"
                                    name="file_datetime" 
                                    onChange={(e) => {handleFileDateTime(e.target.value)}}
                                    min="1900-01-01T00:00"
                                    max="2100-01-01T00:00"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formLocation" className="mb-3">
                                <Form.Label>Postal Code</Form.Label>
                                { fileLocationNotValid ? <Alert variant="warning">{fileLocationNotValid}</Alert> : null }
                                <Form.Control 
                                    type="text"
                                    name="file_location" 
                                    onChange={(e) => {handleFileLocation(e.target.value)}}
                                />
                            </Form.Group>

                            <Form.Group controlId="formVideo" className="mb-3">
                                <Form.Label>Video</Form.Label>
                                { fileVideoNotValid ? <Alert variant="warning">{fileVideoNotValid}</Alert> : null }
                                <Form.Control 
                                    type="file"
                                    name="file_video" 
                                    onChange={(e) => {handleFileVideo(e.target.files[0])}}
                                    accept="video/*"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formFile" className="mb-3">
                                <Button 
                                    variant="primary" 
                                    type="submit"
                                >Next</Button>
                                {' '}<br /><br />
                                <Button 
                                    variant="light"
                                    onClick={handleReset}
                                >Clear Form</Button>
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col sm={4}>
                        { thumbnailImage ? <div>
                            <h2>Video Thumbnail</h2>
                            <img className="img-fluid" src={thumbnailImage} />
                            <Table striped bordered hover>
                                <tbody>
                                    <tr>
                                        <td>Duration</td>
                                        <td>{new Date(videoMetadata.duration * 1000).toISOString().slice(11, 19)}</td>
                                    </tr>
                                    <tr>
                                        <td>Video Width</td>
                                        <td>{videoMetadata.width}</td>
                                    </tr>
                                    <tr>    
                                        <td>Video Height</td>
                                        <td>{videoMetadata.height}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            </div> : <div></div> }
                    </Col>
                </Row>
            </Container>
            <Container style={{ display: (formState=="toc") ? "block" : "none" }}>
                <Row>
                    <Col sm={6}>
                        <div className="text-center">
                            <h1>Terms and Conditions</h1>
                            <p>By uploading a video, you agree to the following terms and conditions:</p>
                            <p>1. You are the owner of the video and have the right to upload it.</p>
                            <p>2. You are not uploading any illegal content.</p>
                            <p>3. You are not uploading any content that is not suitable for minors.</p>
                            <p>4. You are not uploading any content that is not suitable for work.</p>
                            <p>5. You are not uploading any content that is not suitable for public viewing.</p>
                            <p>6. You are not uploading any content that is not suitable for viewing by people with photosensitive epilepsy.</p>
                            { mustAcceptToc ? <Alert variant="warning">{mustAcceptToc}</Alert> : null }
                            <Form id="toc_form">
                            <Form.Check 
                                type="checkbox"
                                id="toc_accepted" 
                                label="I agree to the terms and conditions."
                                onChange={(e) => {handleTOC(e.target.checked)}}
                            />
                            <br />
                            <Button 
                                variant="primary" 
                                type="submit" 
                                onClick={handleSubmit}
                            >Upload</Button>
                            {' '}<br /><br />
                            <Button 
                                variant="light" 
                                type="submit" 
                                onClick={() => setFormState("form")}
                            >Go Back</Button>
                            {' '}<br /><br />
                            
                            <Button 
                                variant="light" 
                                type="submit" 
                                onClick={handleReset}
                            >Cancel</Button>
                            </Form>
                        </div>
                    </Col>
                    <Col sm={6}>
                        <div>
                            <h2>Video Thumbnail</h2>
                            <img className="img-fluid" src={thumbnailImage} />
                        </div>
                        <div>
                            <Table striped bordered hover>
                                <tbody>
                                    <tr>
                                        <td>Title</td>
                                        <td>{fileTitle}</td>
                                    </tr>
                                    <tr>
                                        <td>Date and Time</td>
                                        <td>{new Date(fileDateTime).toLocaleString("en-SG")}</td>
                                    </tr>
                                    <tr>    
                                        <td>Postal Code</td>
                                        <td>{fileLocation}</td>
                                    </tr>
                                    <tr>
                                        <td>Duration</td>
                                        <td>{new Date(videoMetadata.duration * 1000).toISOString().slice(11, 19)}</td>
                                    </tr>
                                    <tr>
                                        <td>Video Width</td>
                                        <td>{videoMetadata.width}</td>
                                    </tr>
                                    <tr>    
                                        <td>Video Height</td>
                                        <td>{videoMetadata.height}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
            </Container>
            <Container style={{ display: (formState=="upload") ? "block" : "none" }}>
                <div className="text-center">
                    <h1>Uploading</h1>
                    <p>Please wait while your video is being uploaded.</p>
                    <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
                </div>
            </Container>
            <Container style={{ display: (formState=="upload_completed") ? "block" : "none" }}>
                <div className="text-center">
                    <h1>Upload Completed.</h1>
                    <p>Thank you!</p>
                    <Button variant="primary" type="submit" onClick={handleReset}>Upload More</Button>
                </div>
            </Container>
            <Container style={{ display: (formState=="upload_failed") ? "block" : "none" }}>
                <div className="text-center">
                    <h1>Upload Failed.</h1>
                        {uploadErrors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    <p>Try again?</p>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        onClick={(e) => handleRetry(e)}
                    >Retry Upload</Button>
                    {' '}<br /><br />
                    <Button 
                        variant="light" 
                        type="submit" 
                        onClick={(e) => handleReset(e)}
                    >Cancel</Button>
                </div>
            </Container>
        </>
    );
};

// Thanks to: https://dev.to/rajeshroyal/video-thumbnails-generate-with-vanilla-js-reactjs-like-youtube-3ok8
const getVideoThumbnail = (file, videoTimeInSeconds) => {
    return new Promise((resolve, reject) => {
        if (file.type.match("video")) {
            importFileandPreview(file).then((urlOfFIle) => {
                var video = document.createElement("video");
                var timeupdate = function () {
                    if (snapImage()) {
                        video.removeEventListener("timeupdate", timeupdate);
                        video.pause();
                    }
                };
                video.addEventListener("loadeddata", function () {
                    if (snapImage()) {
                        video.removeEventListener("timeupdate", timeupdate);
                    }
                });
                var snapImage = function () {
                    var canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                    var image = canvas.toDataURL();
                    var success = image.length > 100000;
                    if (success) {
                        URL.revokeObjectURL(urlOfFIle);
                        resolve(image);
                    }
                    return success;
                };
                video.addEventListener("timeupdate", timeupdate);
                video.preload = "metadata";
                video.src = urlOfFIle;
                // Load video in Safari / IE11
                video.muted = true;
                video.playsInline = true;
                video.currentTime = videoTimeInSeconds;
                video.play();
            });
        } else {
            reject("file not valid");
        }
    });
};

// Thanks to: https://dev.to/rajeshroyal/video-thumbnails-generate-with-vanilla-js-reactjs-like-youtube-3ok8
/**
 * modified from getVideoDuration to get video metadata
 * @param videoFile {File}
 * @returns {{
 *  duration: number,
 *  width: number,
*   height: number
 * }} 
 */
const getVideoMedaData = (videoFile)=> {
    return new Promise((resolve, reject) => {
        if (videoFile) {
            if (videoFile.type.match("video")) {
                importFileandPreview(videoFile).then((url) => {
                    let video = document.createElement("video");
                    video.addEventListener("loadeddata", function () {
                        resolve({
                            duration: video.duration,
                            width: video.videoWidth,
                            height: video.videoHeight
                        });
                    });
                    video.preload = "metadata";
                    video.src = url;
                    // Load video in Safari / IE11
                    video.muted = true;
                    video.playsInline = true;
                    video.play();
                    //  window.URL.revokeObjectURL(url);
                });
            }
        } else {
            reject(0);
        }
    });
};

// Thanks to: https://dev.to/rajeshroyal/video-thumbnails-generate-with-vanilla-js-reactjs-like-youtube-3ok8
// convert image to object part instead of base64 for better performance
// https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
const importFileandPreview = (file, revoke) => {
    return new Promise((resolve, reject) => {
        window.URL = window.URL || window.webkitURL;
        let preview = window.URL.createObjectURL(file);
        //console.log("preview: ", file);
        // remove reference
        if (revoke) {
            window.URL.revokeObjectURL(preview);
        }
        setTimeout(() => {
            resolve(preview);
        }, 100);
    });
}


export default VideoUploadForm;