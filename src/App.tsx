import { useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import '@aws-amplify/ui-react/styles.css'

const client = generateClient<Schema>();


function Square({ value, onSquareClick }: any) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, roomId }: any) {
	console.count("subscribed")

	const handleClick =  ((i: number) => {
		if (calculateWinner(squares) || squares[i]) {
		  return;
		}
		const nextSquares = squares.slice();
		if (xIsNext) {
		  nextSquares[i] = 'X';
		} else {
		  nextSquares[i] = 'O';
		}

		client.mutations.publish({
			channelName: roomId,
			content: JSON.stringify({squares: nextSquares, wasX: xIsNext})
		})

		onPlay(nextSquares);
	})

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

const Game = ({roomId, isX}: any) => {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: any) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  client.subscriptions.receive()
	  .subscribe({
		next: event => {
			console.log(event)
			if (roomId === event.channelName) {
				// Skip our own move
				if (JSON.parse(event.content).wasX === isX) {
					console.log("Skipping own move")
					return
				}
				handlePlay(JSON.parse(event.content).squares)
			}
		}
	  }
	)


  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} roomId={roomId} squares={currentSquares} onPlay={handlePlay} />
      </div>
    </div>
  );
}

function calculateWinner(squares: any) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}



function App() {
  const [room, setRoom] = useState<String | undefined>(undefined)
	const [roomInput, setRoomInput] = useState<string>("")
	const [isRoomOwner, setIsRoomOwner] = useState<boolean>(false)
	const createRoom = () => {
		setRoom(roomInput)
		setIsRoomOwner(true)
		alert(`Room ${roomInput} created`)
	}
	const joinRoom = () => {
		setRoom(roomInput)
		alert(`Room ${roomInput} joined`)
	}

  return (
    <main>
	{!room ? 
		<>
	<input value={roomInput} onChange={e => setRoomInput(e.target.value)} />
	  <button onClick={createRoom}>Create Room</button>
	  <button onClick={joinRoom}>Join Room </button>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
	  </>
	: <>
	<h1>Room {room}</h1>
	<h3>{isRoomOwner ? "You are X" : "You are O"}</h3>
	<Game roomId={room} isX={isRoomOwner}/>
	<button onClick={() => {setRoom("")}}>Return</button>
	</>
	}
    </main>
  );
}

export default App;
