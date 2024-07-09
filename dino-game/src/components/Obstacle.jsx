
import React, { useState, useEffect } from 'react';
import obstacle from '../images/obstacle.png';

function Obstacle(props) {

    //console.log(props)
    //const [leftPos,setLeftPos] = useState(325)
    useEffect(() => {
        if (props.position.left >= 610) {
            const newPosition = Math.floor(Math.random() * (550 - 100 + 1)) + 100; 
            //setLeftPos(newPosition);
            props.onUpdateObstaclePosition(newPosition);
        }
    }, [props.position.left]);

    
    return (
        <div>
            <img src={obstacle} alt="Obstacle" className="obstacle-image" style={{ left: `${props.obstaclePosition.left}px` }} />
        </div>
    );
}

export default Obstacle;
