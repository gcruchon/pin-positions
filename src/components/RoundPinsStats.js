import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';

export const RoundPinsStats = () => {
    const { eventId, round } = useParams();
    const { eventData, holes } = useOutletContext();
    const [roundData, setRoundData] = useState({ roundDate: null, dotColor: null });
    const depthValues = ["back", "middle", "front"];
    const sideValues = ["left", "center", "right"];
    const [stats, setStats] = useState({
        totalHoles: 0,
        front: { left: 0, center: 0, right: 0 },
        middle: { left: 0, center: 0, right: 0 },
        back: { left: 0, center: 0, right: 0 },
    });

    const getColor = (count, total) => {
        if (total > 0) {
            const colorValue = 256 - Math.round(256 * count / total);
            let hexString = colorValue.toString(16);
            if (hexString.length === 1) {
                hexString = "0" + hexString;
            }
            return `#${hexString}${hexString}${hexString}`;
        } else {
            return "#FFFFFF";
        }
    };

    useEffect(() => {
        const roundIndex = isNaN(round)
            ? 0
            : parseInt(round, 10);
        if (roundIndex > 0 && eventData.rounds && eventData.rounds.length >= roundIndex) {
            setRoundData(eventData.rounds[roundIndex - 1]);
        }
    }, [eventData.rounds, round]);

    useEffect(() => {
        const newStat = {
            totalHoles: 0,
            front: { farLeft: 0, left: 0, center: 0, right: 0, farRight: 0 },
            middle: { farLeft: 0, left: 0, center: 0, right: 0, farRight: 0 },
            back: { farLeft: 0, left: 0, center: 0, right: 0, farRight: 0 },
        };
        [...Array(18).keys()].forEach((i => {
            const hole = holes[`${eventId}|${round}|${i + 1}`] || null;
            if (hole
                && hole.distanceFromFront && !isNaN(hole.distanceFromFront)
                && hole.distanceFromSide && !isNaN(hole.distanceFromSide)
                && hole.side) {

                let [depth, side] = ["middle", "center"];
                newStat.totalHoles = newStat.totalHoles + 1;

                if (parseInt(hole.distanceFromFront, 10) < 13) {
                    depth = "front";
                } else if (parseInt(hole.distanceFromFront, 10) >= 22) {
                    depth = "back";
                }

                if (parseInt(hole.distanceFromSide, 10) < 10) {
                    if (hole.side === "L") {
                        side = "left";
                    } else if (hole.side === "R") {
                        side = "right";
                    }
                }
                newStat[depth][side] = newStat[depth][side] + 1;
            }
        }));
        setStats(newStat);
    }, [eventId, holes, round]);


    return (
        <>
            {
                roundData.date
                    ? <>
                        {
                            stats.totalHoles
                                ? <Table bordered>
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '10%' }}></th>
                                            <th style={{ width: '30%' }}>left</th>
                                            <th style={{ width: '30%' }} className="text-center">center</th>
                                            <th style={{ width: '30%' }} className="text-end">right</th>
                                        </tr>
                                        {
                                            depthValues.map(depth => {
                                                return (
                                                    <tr key={`tr-${depth}`}>
                                                        <th style={{ width: '10%' }} className="text-center py-4" >
                                                            {depth}
                                                        </th>
                                                        {
                                                            sideValues.map(side => {
                                                                const style = {
                                                                    width: "30%",
                                                                    backgroundColor: getColor(stats[depth][side], stats.totalHoles)
                                                                };
                                                                return (
                                                                    <td key={`td-${depth}-${side}`} className="text-center py-4" style={style}>
                                                                        {stats[depth][side]}
                                                                    </td>
                                                                )
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                                : <Alert variant="warning" className="mt-4">No stats</Alert>
                        }
                    </>
                    : ''
            }

        </>
    );
}