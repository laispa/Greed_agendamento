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


export class Schedule{
    name!: string;
    start!: number;
    finish!: number;
    lateness!: number;  // Usando Moment.js para representar a data/hora

    
}