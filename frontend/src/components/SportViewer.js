import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import ListTeams from "./ListTeams";
import ListGames from "./ListGames";
import ListPlayers from "./ListPlayers";
import BaseContainer from "./BaseContainer";
import TeamViewer from "./TeamViewer";
import { Col, Row } from "react-bootstrap";
import GameViewer from "./GameViewer";
import PlayerViewer from "./PlayerViewer";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from "dayjs";

/**
 * Contains 3 seperate containers for teams, games and players. Allows filtering capablities for clients to find desired information
 * 
 * @param {*} sport
 * @returns JSX component containing the main display for clients to view sport statistics
 */
function SportViewer({sport}) {
    const [error, setError] = useState(null);
    const [teams, setTeams] = useState(null);
    const [games, setGames] = useState(null);
    const [players, setPlayers] = useState(null);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const callGetAll = async (endpoint) => {
        const response = await fetch(process.env.REACT_APP_BACKEND + `/${endpoint}/get-all`, { method: "GET" });
        const result = await response.json();

        if(response.status === 500) {
            setError("Fatal backend error, please try again.");
            return null;
        }

        return result;
    };

    const refresh = async () => {
        const allTeams = await callGetAll("teams");
        const allGames = await callGetAll("games");
        const allPlayers = await callGetAll("players");
        
        const filteredTeams = allTeams.filter(team => team.sport == sport);
        const teamNames = filteredTeams.map(team => team.name);

        const filteredGames = allGames.filter(game => {
            if(!teamNames.includes(game.winningTeam))
                return false;
            if(!(!selectedTeam || game.winningTeam === selectedTeam.name || game.losingTeam === selectedTeam.name))
                return false;

            if(startDate) {
                if(startDate.isAfter(dayjs(game.date)))
                    return false;
            }

            if(endDate) {
                if(endDate.isBefore(dayjs(game.date)))
                    return false;
            }

            return true;
        });

        const fitleredPlayers = allPlayers.filter(player => {
            return selectedTeam ? selectedTeam.name == player.team : teamNames.includes(player.team);
        });

        setTeams(filteredTeams);
        setGames(filteredGames);
        setPlayers(fitleredPlayers);
    };

    useEffect(() => {
        refresh();
    }, [selectedTeam, startDate, endDate, sport]);

    return (
        <>
            <BaseContainer>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Col sm={2}>
                            {teams && <TeamViewer teams={teams} setSelectedTeam={setSelectedTeam}/>}
                            <h8>Start Date</h8><br/>
                            <DatePicker onChange={(date) => setStartDate(date)} slotProps={{ textField: { size: 'small' } }} sx={{ width: 200 }}/><br/>
                            <h8>End Date</h8><br/>
                            <DatePicker onChange={(date) => setEndDate(date)} slotProps={{ textField: { size: 'small' } }} sx={{ width: 200 }}/>
                        </Col>
                        <Col sm={6}>
                            {games && <GameViewer games={games}/>}
                        </Col>
                        <Col sm={3}>
                            {selectedTeam ? (players && <PlayerViewer players={players}/>) : <h2>Select a team for roster information</h2>}
                        </Col>
                    </Row>
                </LocalizationProvider>
            </BaseContainer>
        </>
    );
}

export default SportViewer;