import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card, Col, Spinner, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';


const CLIENT_ID = '98b841bc097a4d82826596d07b90d05e';
const CLIENT_SECRET = '065089498cb7420190be2e404288b6f5';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [acessToken, setAcessToken] = useState('');
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    var authParams = {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }

    fetch('https://accounts.spotify.com/api/token', authParams)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setAcessToken(data.access_token)
      })
  })



  //Search 

  async function search() {
    if (!searchInput.trim()) {
      setError('Search Term must not be empty');
      return;
    }
  
    setError(null);
    setIsLoading(true);
    console.log('searching for', searchInput)

    var searchParams = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + acessToken
      }
    }

    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParams)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        return data.artists.items[0].id
      })
    console.log('artistID', artistID)

    var album = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums?include_groups=album&limit=50', searchParams)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setAlbums(data.items);
      })
    console.log('albums', album)
  }

  console.log('albums', albums)

  return (
    <div className="App">
      <Container>
      <Row>
        <Col><h6>Spotify Album Search</h6></Col>
        <Col><h6>Created By angel</h6></Col>
      </Row>
        <InputGroup className="mb-3" size='lg'>
          <FormControl
            placeholder="Search For Artist"
            type='input'
            onKeyDown={async event => {
              if (event.key === 'Enter') {
                setIsLoading(true);
                console.log(event.target.value);
                await search();
                setIsLoading(false);
              }
            }}
            onChange={event => { setSearchInput(event.target.value) }}
          />
          <Button onClick={async () => {
            setIsLoading(true);
            await search();
            setIsLoading(false);
          }}>
            Search
          </Button>
          </InputGroup>
          {isLoading && (
            <div className="d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
              <Spinner animation="border" />
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
      </Container>
      <Container>
        <Row className='mx-2 row row-cols-4'>
          {albums.map( (album, i) => {
            return (
              <a href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <Card>
                  <Card.Img src={album.images[0].url} />
                  <Card.Body>
                    <Card.Title>{album.name}</Card.Title>
                    <a href={album.artists[0].external_urls.spotify} target="_blank" rel="noopener noreferrer">
                      <Card.Text>
                        {album.artists[0].name}
                      </Card.Text>
                    </a>
                  </Card.Body>
                </Card>
              </a>
            )
          })}
        </Row>
      </Container>
    </div>
  );
}

export default App;
