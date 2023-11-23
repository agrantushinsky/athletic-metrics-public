/**
 * Component to display a list of games
 * 
 * @param {array} games is an array of games
 * @returns JSX component with a list of games
 */
function ListGames({games}) {
    const gamesList  = games.map((game) => (
        <li key={game._id}>
            [{game.date}] Winning: {game.winningTeam}, Losing: {game.losingTeam}. Rating: {game.rating}
        </li>
    ));

    return (
        <ul>{gamesList}</ul>
    )
}

export default ListGames;