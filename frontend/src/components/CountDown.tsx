import { useEffect, useState } from "react"

interface Props {
    endDate: Date
    isEnded: boolean
}

function format_date(date: Date) {
    return new Date(date).toLocaleString()
}

export default function CountDown({ endDate, isEnded }: Props) {
    const [ended, setEnded] = useState(false)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)




    useEffect(
        () => {
            const time = new Date(endDate).getTime()
            if (time > Date.now()) {
                const inter = setInterval(() => {
                    let delta = new Date(endDate).valueOf() - Date.now().valueOf();
                    if (delta < 0) {
                        clearInterval(inter)
                        setEnded(true)
                    }
                    // let asDeltaDate = new Date(delta);
                    const deltaSec = Math.floor(delta/1000)
                    const sec = deltaSec % 60
                    let q = Math.floor(deltaSec/60) 
                    const min = q % 60
                    const hours = Math.floor( q /60)
                    setHours(hours)
                    setMinutes(min)
                    setSeconds(sec)

                }, 1000)
            } else {
                setEnded(true)
            }

        },
    )
    return (
        <div className="stat">
            <div className="stat-title">Ends in</div>
            <div className="stat-value">
                {(!ended && !isEnded)?
                    <span className="countdown">
                        {/*// @ts-ignore */}
                        <span style={{ "--value": hours }}></span>:
                        {/*// @ts-ignore */}
                        <span style={{ "--value": minutes }}></span>:
                        {/*// @ts-ignore */}
                        <span style={{ "--value": seconds }}></span>
                    </span>
                    :
                    <span> Ended </span>
                }
            </div>
            <div className="stat-desc">{(!ended && !isEnded )? "Ends on " : "Ended on "} {format_date(endDate)}</div>
        </div>
    )
}
