/** Returns { start, end } for today (midnight to midnight UTC) */
const todayRange = () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    return { start, end };
};
 
/** Returns { start, end } for yesterday */
const yesterdayRange = () => {
    const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setDate(end.getDate() - 1);     end.setHours(23, 59, 59, 999);
    return { start, end };
};
 
/** Returns the start of the current ISO week (Monday 00:00:00) */
const weekStart = () => {
    const d = new Date();
    const day = d.getDay();                    // 0=Sun … 6=Sat
    const diff = (day === 0 ? -6 : 1 - day);  // distance to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

export { todayRange, yesterdayRange, weekStart };