import React, { useState, useEffect } from 'react';

function Leaderboard(props) {
    const [leaderboardData, setLeaderboardData] = useState(null);
    useEffect(() => {
        updateLeaderboard();
        getLeaderboard();
    }, [props.score]); // Include props.score in the dependency array if it's used in updateLeaderboard()

    
    function updateLeaderboard() {
        fetch('http://3.144.37.52:5000/:5000/write', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Score: props.score })
        })
            .then(response => response.json())
            .then(response => {
                console.log(response)
                
            })
            .catch(error => console.log(error));
    }

    function getLeaderboard() {
        fetch('http://3.144.37.52:5000/read', {
            method: 'GET',
        })
            .then(response => response.json())
            .then(response => {
                console.log(response);
                setLeaderboardData(response);
            })
            .catch(error => console.log(error));
    }

    return (
        <>
            {true && (
                <div className='game-over'>
                    <h1 >Game Over</h1>
                    <h5>LeaderBoard</h5>
                    { leaderboardData && leaderboardData.map((item, index) => (
                        <p key={index}>{item.Score}</p>
                    ))}
                </div>
            )}
        </>
    );
}

export default Leaderboard;