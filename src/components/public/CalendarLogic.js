function createCalendar(propDate) {
    let current = propDate
    let currDate = parseInt(current.getDate())
    let currYear = parseInt(current.getFullYear())
    let currMonth = parseInt(current.getMonth())
    let cacheDate = new Date(currYear, currMonth, 1)

    let emptyIndx = 0
    let calendarBody = []
    while(currMonth == cacheDate.getMonth()) {
        let week = []
        for(let j = 0; j < 7; j++) {
            if(j == cacheDate.getDay() && currMonth == cacheDate.getMonth()) {
                week.push(
                    <div className={`date ${currDate == cacheDate.getDate() && new Date().getMonth() == cacheDate.getMonth() ? 'current' : ''}`}
                        key={`date-${cacheDate.getDate()}`}>
                        <span>{cacheDate.getDate()}</span>
                    </div>
                )
                cacheDate.setDate(cacheDate.getDate() + 1)
            } else {
                week.push(
                    <div className="date"
                        key={`empty-${emptyIndx}`}></div>
                )
                emptyIndx++
            }
        }
        calendarBody.push(
            <div className="cal-row week"
                key={`week-${calendarBody.length}`}>
                {week.map((day) => (
                    day
                ))}
            </div>
        )
    }
    return calendarBody
}

export default createCalendar