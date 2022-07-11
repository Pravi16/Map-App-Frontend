import * as React from 'react';
import Map,{Marker,Popup,Source, Layer}  from 'react-map-gl';
import {LocationOn,Star,StarOutline,Room} from '@material-ui/icons';
import 'mapbox-gl/dist/mapbox-gl.css';
import './app.css';
import axios from "axios";
import { format } from 'timeago.js';
import Register from './components/Register';
import Login from './components/Login';

<script src="https://cdnjs.cloudflare.com/ajax/libs/timeago.js/4.0.2/timeago.min.js" integrity="sha512-SVDh1zH5N9ChofSlNAK43lcNS7lWze6DTVx1JCXH1Tmno+0/1jMpdbR8YDgDUfcUrPp1xyE53G42GFrcM0CMVg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

function App() {
  const myStorage = window.localStorage;
  const [currentUser,setCurrentUser] = React.useState(myStorage.getItem("user"));
  const [pins,setPins] = React.useState([]);
  const [star, setStar] = React.useState(0);

  const [currentPlaceId,setCurrentPlaceId] = React.useState(null);
  const [newPlace,setNewPlace] = React.useState(null);
  const [viewport, setViewport] = React.useState({
    latitude: 47.040182,
    longitude: 17.071727,
    zoom: 4,
  });
  const [showRegister,setShowRegister] = React.useState(false);
  const [showLogin,setShowLogin] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const [showPopup, setShowPopup] = React.useState(true);
  React.useEffect((p) => {
    const getPins = async ()=>{
      try{
        const res = await axios.get("/pins");
        setPins(res.data);
      }catch(err){
        console.log(err)
      }
    };
    getPins();
  },[]);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (event) => {
    const {lat, lng} = event.lngLat;
    setNewPlace({
      lat: lat,
      long: lng,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };
    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };
  const handleLogout = () => {
    setCurrentUser(null);
    myStorage.removeItem("user");
  };
  return (
    <div className="App">
    <Map
      initialViewState={{
      longitude: 17,
      latitude: 46,
      zoom: 4
    }}
    style={{width: '99vw', height: '98vh'}}
    mapStyle="mapbox://styles/mapbox/streets-v9"
    mapboxAccessToken={process.env.REACT_APP_MAPBOX}
    onDblClick={handleAddClick}
  >
    {pins.map(p=>(
<>
      <Marker longitude={p.long} latitude={p.lat} anchor="bottom" 
      onClick={()=>handleMarkerClick(p._id,p.lat,p.long)}
      offsetLeft={-3.5 * viewport.zoom}
      offsetTop={-7 * viewport.zoom} >
        <LocationOn style={{fontSize:40, color:p.username===currentUser ? "blue":"red",cursor:"pointer"}}/>
      </Marker>

      {p._id === currentPlaceId && (
        <Popup longitude={p.long} latitude={p.lat}
        anchor="top"
        closeButton={true}
        closeOnClick={false}
        onClose={()=>setCurrentPlaceId(null)}
        >
        <div className='card'>
        <label htmlFor="">Place</label>
          <h3 className='place'>{p.title}</h3>
          <label htmlFor="">Review</label>
          <p className='desc'>{p.desc}</p>
          <label htmlFor="">Rating</label>
          <div className='stars'>
          {Array(p.rating).fill(<Star className="star" />)}
          </div>

          <label htmlFor="">Description</label>
          <span className='username'>Created By <b>{p.username}</b> </span>
          <span className='time'>{format(p.createdAt)}</span>

          
        </div>
      </Popup>)
    }
      </>
      ))}
      {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            anchor="left"
            onClose={() => setNewPlace(null)}
          >
            <div>
              <form onSubmit={handleSubmit}>
                <label>Place</label>
                <input
                  placeholder="Enter Place Name"
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Description</label>
                <textarea
                  placeholder="Review this place"
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Rating</label>
                <select onChange={(e) => setStar(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button type="submit" className="submitButton">
                  Add Pin
                </button>
              </form>
            </div>
          </Popup>
        )}
        
        {currentUser? (<button className='button logout' onClick={handleLogout}>LOG OUT</button>) : (
          <div className='buttons'>
          <button className='button login' onClick={()=>setShowLogin(true)}>LOG IN</button>
          <button className='button register' onClick={()=>setShowRegister(true)}>REGISTER</button>
          </div>
        )}          
          
        
        {showRegister && <Register setShowRegister={setShowRegister}/>}
        {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser}/>}
    </Map>
    </div>
    );
  }
  
  export default App;
  