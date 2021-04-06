//librería para leer el input del usuario
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//cálculo del puntaje en base al valor entregado, aquí termina el chaining
const calculate = (x) => ({
    on: () => calculate(x),
    other: () => x,
});

//revisión del puntaje correspondiente usando un objeto que permite realizar chaining
const review = (x) => ({
    on: (type, value) => (type === x ? calculate(value) : review(x)),
    other: fn => fn(x),
});

//se ingresa la jugada de un jugador donde lanzamientos es de la forma ['DB',[3,19],[2,20]]
const enter_play = (score) => {
    return (throwings) => throwings.reduce((total, throwing) => (total - review(throwing).on('DB', 50).on('SB', 25).other(x => x[0] * x[1]))
      , score);
};

//se inicializa el juego con un puntaje de 501
const initPlayers = (...names) => {
  const players = names.map(player => [player, 501]);
  return players;
};

//crea una promesa con el texto que ingresó el usuario
const ask = (questionText) => {
  return new Promise((resolve, reject) => {
    rl.question(questionText, (input) => resolve(input) );
  });
};

//lee y mapea la entrada del usuario, para luego retornarla como un array
const askTurn = async () => {
  const moveStr = await ask('Ingresa la jugada:');
  const move = JSON.parse(moveStr.replace(/'/g, '"'));
  return move;
};

//indica si algún jugador llegó a un puntaje igual a cero
const winner = (players) => {
  return players.some((player) => player[1] === 0);
};

//función recursiva que permite iterar por los jugadores y obtener sus lanzamientos 
const game = (players) => (j) => async (next) => {
  console.log(`Es el turno de  ${players[j][0]} con ${players[j][1]} puntos`);
	const move = await askTurn();
	players[j][1] = Math.abs(enter_play(players[j][1])(move));
  console.log(`${players[j][0]} queda con ${players[j][1]} puntos\n`);
	return winner(players) ? players[j] : game(players)(next(j, players))(next);
}

//función que inicia el juego y su lógica
const play_game = async (...names) => {
  const winner = await game(initPlayers(...names))(0)((j, players) => j === players.length - 1 ? 0 : j + 1);
  console.log(`El ganador es ${winner[0]}`);
};

//inicio del juego
play_game('Jaime', 'Emma');
