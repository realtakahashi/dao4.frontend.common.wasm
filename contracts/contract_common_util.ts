
export const checkEventsAndInculueError = (events:any[]):boolean => {
    events.forEach(({ event:{data}}) => {
        console.log("### data.methhod:",data.method);
        if (data.method == "ExtrinsicFailed"){
          return true;
        }
    });
    return false;
} 