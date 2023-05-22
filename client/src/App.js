import './App.css';
import VideoUploadForm from './components/videouploadform.js';
import VideoList from './components/videolist.js';

function App() {
  return (
    <div className="App">
        <VideoUploadForm upload_api_path={"/api/upload"} />
        <hr />
        <VideoList list_api_path={"/api/list"} view_api_path={"/api/video"} />
    </div>
  );
}

export default App;
