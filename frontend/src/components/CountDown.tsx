import { useEffect, useRef, useState } from "react"

interface Props {
    endDate: Date
}

function format_date(date: Date) {
    return new Date(date).toLocaleString()
}

export default function CountDown({ endDate }: Props) {
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
                    let asDeltaDate = new Date(delta);
                    setHours(asDeltaDate.getHours())
                    setMinutes(asDeltaDate.getMinutes())
                    setSeconds(asDeltaDate.getSeconds())

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
                {!ended ?
                    <span className="countdown">
                        <span style={{ "--value": hours }}></span>:
                        <span style={{ "--value": minutes }}></span>:
                        <span style={{ "--value": seconds }}></span>
                    </span>
                    :
                    <span> Ended </span>
                }
            </div>
            <div className="stat-desc">{!ended?"Ends on ":"Ended on "} {format_date(endDate)}</div>
            </div>
    )
}
