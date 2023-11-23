/**
 * Component to display a list of players
 * 
 * @param {array} players is an array of players
 * @returns JSX component with a list of players
 */
function ListPlayers({players}) {
    const playersList  = players.map((player) => (
        <li key={player._id}>
            {player.name}: Age: {player.age}, Points: {player.points}, Team: {player.team}
        </li>
    ));

    return (
        <ul>{playersList}</ul>
    )
}

export default ListPlayers;