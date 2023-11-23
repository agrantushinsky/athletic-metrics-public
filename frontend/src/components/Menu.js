import Button from '@mui/material/Button'

/**
 * Menu contains buttons displayed vertically and onClick, setDisplay is set to the JSX for the selected component.
 * 
 * @param {*} setDisplay setter to pass the parent component the JSX for the newly selected option.
 * @returns JSX component containing buttons.
 */
function Menu({ setDisplay, AddComponent, GetComponent, GetAllComponent, UpdateComponent, DeleteComponent }) {
    const menuItem1 = <AddComponent setDisplay={setDisplay} />;
    const menuItem2 = <GetComponent setDisplay={setDisplay} />;
    const menuItem3 = <GetAllComponent setDisplay={setDisplay} />;
    const menuItem4 = <UpdateComponent setDisplay={setDisplay} />;
    const menuItem5 = <DeleteComponent setDisplay={setDisplay} />;

    return (
        <div className="d-flex justify-content-center flex-column">
            <Button variant="contained" onClick={() => setDisplay(menuItem1)}>
                Add
            </Button>
            <p />
            <Button variant="contained" onClick={() => setDisplay(menuItem2)}>
                Get Single
            </Button>
            <p />
            <Button variant="contained" onClick={() => setDisplay(menuItem3)}>
                Get All
            </Button>
            <p />
            <Button variant="contained" onClick={() => setDisplay(menuItem4)}>
                Update
            </Button>
            <p />
            <Button variant="contained" onClick={() => setDisplay(menuItem5)}>
                Delete
            </Button>
        </div>
    );

}

export default Menu;