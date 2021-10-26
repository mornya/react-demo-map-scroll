import React, { useRef, useState, useEffect, useCallback } from 'react';

/*
 * MapView
 *
 * props: {
 *   size: [number, number] // 맵 사이즈 [X, Y]
 * }
 */
const MapView = (props) => {
  const refViewport = useRef(); // .viewport 에 대한 ref
  const [mousePosX, setMousePosX] = useState(0); // 마우스 X 포지션
  const [mousePosY, setMousePosY] = useState(0); // 마우스 Y 포지션
  const [isMouseDown, setMouseDown] = useState(false); // 마우스 드래그 여부
  const [mapPosX, setMapPosX] = useState(Math.floor(props.size[0] / 2)); // 맵 X 포지션
  const [mapPosY, setMapPosY] = useState(Math.floor(props.size[1] / 2)); // 맵 Y 포지션
  const [markers, setMarkers] = useState([]); // 마커 위치 포지션

  /*
   * onMouseDown
   * 마우스 클릭시 핸들러 입니다.
   */
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    setMousePosX(e.pageX || e.clientX);
    setMousePosY(e.pageY || e.clientY);
    setMouseDown(true);
  }, []);

  /*
   * onMouseMove
   * 마우스 이동시 포지션을 저장하며, 드래그시에는 맵 이동을 위한 포지션을 계산합니다.
   */
  const onMouseMove = useCallback((e) => {
    const mouseCurrPosX = e.pageX || e.clientX;
    const mouseCurrPosY = e.pageY || e.clientY;

    setMousePosX(mouseCurrPosX);
    setMousePosY(mouseCurrPosY);

    if (isMouseDown) {
      const x = mapPosX - (mouseCurrPosX - mousePosX);
      const y = mapPosY - (mouseCurrPosY - mousePosY);
      const maxX = props.size[0] - refViewport.current.clientWidth;
      const maxY = props.size[1] - refViewport.current.clientHeight;

      setMapPosX(x < 0 ? 0 : (x > maxX ? maxX : x));
      setMapPosY(y < 0 ? 0 : (y > maxY ? maxY : y));
    }
  }, [props, isMouseDown, mapPosX, mousePosX, mapPosY, mousePosY]);

  /*
   * onMouseUp
   * 마우스 드래그가 종료될 때 핸들러 입니다.
   */
  const onMouseUp = useCallback(() => setMouseDown(false), []);

  /*
   * onContextMenu
   * 마우스 우클릭시 마커를 얹기 위해 포지션을 저장합니다.
   */
  const onContextMenu = useCallback((e) => {
    e.preventDefault();

    const mouseCurrPosX = e.pageX || e.clientX;
    const mouseCurrPosY = e.pageY || e.clientY;

    setMarkers([
      ...markers,
      [
        mapPosX + mouseCurrPosX - refViewport.current.parentElement.offsetLeft - 30 + 5, // 30 = round(118 / 2) / 2
        mapPosY + mouseCurrPosY - refViewport.current.parentElement.offsetTop - 36 - 30, // 36 = (114 / 2) / 2
      ],
    ]);
  }, [markers, mapPosX, mapPosY]);

  /*
   * onClickReset
   * "초기화" 버튼 클릭시 핸들러 입니다.
   */
  const onClickReset = useCallback(() => setMarkers([]), [setMarkers]);

  // ========== //

  useEffect(() =>{
    // 마운트시 이벤트 핸들러를 등록합니다.
    if (refViewport.current) {
      window.addEventListener('mousedown', onMouseDown, false);
      window.addEventListener('mousemove', onMouseMove, false);
      window.addEventListener('contextmenu', onContextMenu, false);
    }

    // 언마운트시 이벤트 핸들러를 제거합니다.
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, [onMouseDown, onMouseMove, onContextMenu]);

  useEffect(() => {
    // 마우스 클릭시 1회성 이벤트 핸들러를 등록합니다.
    if (isMouseDown) {
      window.addEventListener('mouseup', onMouseUp, { once: true });
    }
  }, [isMouseDown, onMouseUp]);

  useEffect(() => {
    // 맵 포지션이 변경되면 맵의 스크롤 위치를 변경합니다.
    refViewport.current.scrollLeft = mapPosX;
    refViewport.current.scrollTop = mapPosY;
  }, [mapPosX, mapPosY]);

  return (
    <div className="wrap">
      {/* 초기화 버튼 */}
      <button type="button" title="초기화" className="btn-reset" onClick={onClickReset}/>

      {/* 맵 좌표 및 마커 갯수 등 표시 */}
      <div className="info">Coord: {mapPosX},{mapPosY} | Markers: {markers.length}</div>

      {/* 뷰포트는 맵 및 마커 영역으로, 스크롤되는 영역 */}
      <div ref={refViewport} className="viewport">
        {/* map */}
        <img
          src="http://localhost:3000/map.png"
          alt="지도"
          className="map"
          width={props.size[0]}
          height={props.size[1]}
        />
        {/* markers */}
        {markers.map(([markerX, markerY], index) => (
          <img
            key={`marker-${index}`}
            src="http://localhost:3000/marker.png"
            className="marker"
            alt={`마커#${index}`}
            width={59}
            height={72}
            style={{ left: `${markerX}px`, top: `${markerY}px` }}
          />
        ))}
      </div>
    </div>
  );
};
MapView.defaultProps = {
  size: [0, 0],
};

export default MapView;
