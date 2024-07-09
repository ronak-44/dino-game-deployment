
import React, { useState, useEffect, useRef } from 'react';
import '../styles/Box.css';
import dino from '../images/dinosaur.png';
import dino_left from '../images/dinosaur_left.png';
import dino_right from '../images/dinosaur_right.png';
import dino_dead from '../images/dinosaur_die.png';
import ground from '../images/ground.png';
import cloud from '../images/cloud.png';
import Obstacle from './Obstacle';
import Leaderboard from './Leaderboard';



function Box() {

  const [intervalId, setIntervalId] = useState(null);
  const [isRunning, setisRunning] = useState(false);
  const [obstaclePosition, setObstaclePosition] = useState({ left: 325, bottom: 23 });

  const [difficulty,setDifficulty] = useState(10);
  const difficultyRef = useRef(difficulty);
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  const handleUpdateObstaclePosition = (newLeftPosition) => {
    setObstaclePosition(prevState => ({
      ...prevState,
      left: newLeftPosition
    }));
  };

  const [collisionDetected, setCollisionDetected] = useState(false);
  const [score, setScore] = useState(-1)




  const [position, setPosition] = useState({
    bottom: 23,
    left: 10,
    dinoImage: dino,
  });

  const dinoWidth = 40;
  const dinoHeight = 45;
  const obstacleWidth = 30;
  const obstacleHeight = 25;

  useEffect(() => {
    // Check collision
    if (!collisionDetected && checkCollision(obstaclePosition, obstacleWidth, obstacleHeight, position, dinoWidth, dinoHeight)) {
      console.log('Collision detected!');
      setCollisionDetected(true);
      // setisRunning(false)
      clearInterval(intervalId);
      setPosition(prevPosition => {
        return {
          ...prevPosition,
          dinoImage: dino_dead,
        };

      })

    }
  }, [obstaclePosition, position, collisionDetected]);

  function checkCollision(obstaclePos, obstacleWidth, obstacleHeight, dinoPos, dinoWidth, dinoHeight) {
    setScore(score + 1)
    const threshold = 20;

    // Calculate bounding box coordinates for obstacle


    const obstacleLeft = obstaclePos.left + threshold;
    const obstacleRight = obstaclePos.left + obstacleWidth - threshold;
    const obstacleTop = obstaclePos.bottom + obstacleHeight - threshold; // Assuming position.bottom is top of the obstacle
    const obstacleBottom = obstaclePos.bottom + threshold;

    // Calculate bounding box coordinates for dinosaur
    const dinoLeft = dinoPos.left;
    const dinoRight = dinoPos.left + dinoWidth;
    const dinoTop = dinoPos.bottom + dinoHeight; // Assuming position.bottom is top of the dinosaur
    const dinoBottom = dinoPos.bottom;

    // Check collision
    if (
      obstacleRight >= dinoLeft &&
      obstacleLeft <= dinoRight &&
      obstacleBottom <= dinoTop &&
      obstacleTop >= dinoBottom
    ) {
      // Collision detected
      return true;
    }


    // No collision
    return false;
  }


  function restartGame() {
    setDifficulty(10)
    setisRunning(false)
    clearInterval(intervalId);
    setCollisionDetected(false);
    setScore(-1)
    setObstaclePosition({ left: 325, bottom: 23 })
    setPosition({
      left: 10,
      dinoImage: dino,
      bottom: 23,
    })
  }


  // useEffect(() => {
  //   console.log(intervalId);
  // }, [intervalId]);





  function startGame() {
    setisRunning(true);
    const interval = setInterval(() => {
      setPosition(prevPosition => {
        if (prevPosition.left >= 610) {
          console.log("die");
          //clearInterval(interval);
          // return {
          //   ...prevPosition,
          //   dinoImage: dino_dead,
          // };
          setDifficulty(difficultyRef.current + 1);
          return {
            ...prevPosition,
            left: 10,
            dinoImage: prevPosition.dinoImage === dino_right ? dino_left : dino_right,
          };
        }

        return {
          ...prevPosition,
          left: prevPosition.left + difficultyRef.current,
          dinoImage: prevPosition.dinoImage === dino_right ? dino_left : dino_right,
        };
      });
    }, 100);
    setIntervalId(interval)
  }


  function jump() {
    // console.log('jump');
    // clearInterval(intervalId);
    setPosition(prevPosition => {
      return {
        ...prevPosition,
        left: prevPosition.left + 40,
        bottom: prevPosition.bottom + 60,
      };
    })

    setTimeout(() => {
      setPosition(prevPosition => {
        return {
          ...prevPosition,
          bottom: 23,
        };
      });
    }, 100);
    // startGame();

  };


  useEffect(() => {
    const handleKeyDown = (event) => {
      if(collisionDetected){
        window.removeEventListener('keydown', handleKeyDown);
      }
      else if (isRunning && event.code === 'Space') {
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [intervalId,collisionDetected]);

  return (
    <div>
      <div className='center-box' >
        <p className='score'>Score : {score}</p>
        {/* {collisionDetected && <h1 className='game-over'>Game Over </h1>} */}
        {collisionDetected && <Leaderboard score={score}/>}
        {/* <div className='image-wrapper'><img src={cloud} alt="Cloud" className="cloud-image" /></div> */}
        <img src={cloud} alt="Cloud"
          className={`cloud-image ${isRunning && !collisionDetected ? 'animate' : ''}`}
        />
        <img
          src={position.dinoImage}
          alt="Dinosaur"
          className="dino-image"
          style={{ left: `${position.left}px`, bottom: `${position.bottom}px` }}
        />

        <img src={ground} alt="Ground" className="ground-image" />


        <Obstacle position={position} obstaclePosition={obstaclePosition} onUpdateObstaclePosition={handleUpdateObstaclePosition}/>

      </div>
      <button type="button" className="btn btn-dark startButton" onClick={startGame} disabled={isRunning}>
        <span class="material-symbols-outlined">
          play_arrow
        </span>
      </button>
      <button type="button" className="btn btn-dark restartButton" onClick={restartGame} disabled={!isRunning}>
        <span class="material-symbols-outlined">
          restart_alt
        </span>
      </button>
    </div>
  );
}

export default Box;
