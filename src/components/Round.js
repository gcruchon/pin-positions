import { Hole } from "./Hole";

export const Round = ({ eventId, round, roundDate, dotColor, isVisible, holes }) => {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const holeComponents = [];
    for (let i = 1; i <= 18; i++) {
        const hole = holes[`${eventId}|${round}|${i}`] || {}
        holeComponents.push(<Hole eventId={eventId} round={round} hole={i} value={hole} key={`${round}-${i}`} />);
    }

    const visibilityClass = isVisible ? "" : "d-none";

    return (
        <div className={visibilityClass}>
            <p>Date: {roundDate.toLocaleDateString("en-GB", dateOptions)} - Dot color: {dotColor}</p>
            {holeComponents}
        </div>
    );
}