import React, { useState, useCallback, useEffect } from 'react'
import MapView from './components/MapView';
import './App.css';

const mapImage = new Image();

const App = () => {
  const [sizeX, setSizeX] = useState(0);
  const [sizeY, setSizeY] = useState(0);

  const onLoadImage = useCallback((e) => {
    setSizeX(e.target.width);
    setSizeY(e.target.height);
  }, [setSizeX, setSizeY]);

  useEffect(() => {
    // 지도 이미지의 전체 사이즈를 얻어옵니다.
    mapImage.src = 'http://localhost:3000/map.png';
    mapImage.addEventListener('load', onLoadImage, { once: true });
  }, [onLoadImage]);

  return (
    <div className="App">
      {sizeX && sizeY ? <MapView size={[sizeX, sizeY]}/> : null}
    </div>
  );
}

export default App;
