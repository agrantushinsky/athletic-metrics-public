/**
 * Component to display a list of teams
 * 
 * @param {array} teams is an array of teams
 * @returns JSX component with a list of teams
 */
function ListTeams({teams}) {
    const teamsList = teams.map((team) => (
        <li key={team._id}>
            {team.name} originating from {team.countryOfOrigin} for the sport: {team.sport}
        </li>
    ));

    return (
        <ul>{teamsList}</ul>
    )
}

export default ListTeams;