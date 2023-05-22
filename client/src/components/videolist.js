import { useState, useEffect, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Table from 'react-bootstrap/Table';

import axios from "axios";

function VideoList({ list_api_path, view_api_path }) {
    const [videos, setVideos] = useState([]);
    const [view, setView] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const [videoLink, setVideoLink] = useState("");
    const [showVideo, setShowVideo] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        axios.get(list_api_path)
        .then((response) => {
            setVideos(response.data.data);
            setLoading(false);
            setError(null);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
    }, [list_api_path]);
    
    const handleLoadList = () => {
        setShowVideo(false);
        setVideoLink({
            url: '',
            mimetype: ''
        });
        

        setLoading(true);
        axios.get(list_api_path)
        .then((response) => {
            setVideos(response.data.data);
            setLoading(false);
            setError(null);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
    };

    //Max video size 10MB https://www.google.com/search?q=html5+video+max+filesize&oq=html5+video+max+filesize&aqs=chrome..69i57j0i22i30j0i390i650l2.4382j0j7&sourceid=chrome&ie=UTF-8
    const handleVideoPlay = (fid) => {
        var vpath = view_api_path + "/" + fid;
        if (showVideo) { // if video is already playing delete the node to reset the DOM just in case.
            setShowVideo(false);
            setTimeout(() => {
                //console.log("view_api_path: " + view_api_path);
                //console.log("fid: " + fid);
                //console.log("vpath: " + vpath);
                setVideoLink(vpath);
                setShowVideo(true);
            }, 1000);
        } else {
            setVideoLink(vpath);
            setShowVideo(true);
        }

        
    };


    /* const handleView = (id) => {
        setLoading(true);
        axios.get(view_api_path + id)
        .then((response) => {
            setView(response.data);
            setLoading(false);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
    }; */
    
    const handleViewClose = () => {
        setView(null);
    };
    
    const handleDelete = (id) => {
        setLoading(true);
        axios.delete(list_api_path + id)
        .then((response) => {
            setVideos(response.data);
            setLoading(false);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
    };
    
    return (
        <Container>
        <Row>
            <Col>
            <h1>Video List</h1>
            </Col>
        </Row>
        <Row>
            <Col>
            {loading && <ProgressBar now={progress} label={`${progress}%`} />}
            {error && <Alert variant="danger">{error.message}</Alert>}
            {showVideo && 
            <div style={{ display: (showVideo) ? "block" : "none" }}>
                <video
                    width="100%"
                    height="100%"
                    controls
                    autoPlay
                >
                    <source 
                        src={videoLink}
                    />
                </video>
            </div>
            }
            
            <Table striped bordered hover>
            <thead>
                <tr>
                <th>Video Title</th>
                <th>Video Date</th>
                <th>Location</th>
                <th>Duration</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {videos.map((vobj, index) => (
                <tr key={vobj.id}>
                    <td>{vobj.title}</td>
                    <td>{new Date(vobj.datetime).toLocaleString("en-SG")}</td>
                    <td>{vobj.location}</td>
                    <td>{new Date(vobj.duration * 1000).toISOString().slice(11, 19)}</td>
                    <td><Button variant="primary" onClick={() => handleVideoPlay(vobj.fileid)}>View</Button></td>
                </tr>
            ))}
            </tbody>
            </Table>
            </Col>
        </Row>
        <Row>
            <Col>
                <Button variant="primary" onClick={handleLoadList}>Reload List</Button>
            </Col>
        </Row>
        </Container>
    );
};



export default VideoList;