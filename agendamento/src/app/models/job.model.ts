export class Job{
    name: string;
    duration: number;
    deadline: number;

    constructor(name: string, duration: number, deadline: number) {
        this.name = name;
        this.duration = duration;
        this.deadline = deadline;
      
    }
  
}

export class JobSchedule{
    name: string;
    start: string;
    finish: string;

    constructor(name: string, start: string, finish: string) {
        this.name = name;
        this.start = start;
        this.finish = finish;
      
    }
  
}



export class ScheduleLateness{
    name!: string;
    start!: number;
    finish!: number;
    lateness!: number;  // Usando Moment.js para representar a data/hora

    
}


export class Schedule{
    name!: string;
    start!: string;
    finish!: string;
}