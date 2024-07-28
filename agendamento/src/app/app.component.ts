import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Job, Schedule } from './models/job.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'agendamento';
  jobCounter: number = 0;

  schedule: Schedule[] = [];

  myForm!: FormGroup;
  latenessMax: number = 0;

  startTime!: number;

  JOB: Job[] = [
    new Job("Job 1", 3, 13),
    new Job("Job 2", 2, 9),
    new Job("Job 3", 1, 15),
    new Job("Job 4", 4, 14),
    new Job("Job 5", 3, 9),
    new Job("Job 6", 2, 6),
    new Job("Job 7", 4, 8),
    new Job("Job 8", 1, 6)
];


  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.myForm = this.fb.group({
      jobs: this.fb.array([this.createItem()]),
      startTime: [null, [Validators.required, this.timeValidator]]
    });
  }

  get jobs(): FormArray {
    return this.myForm.get('jobs') as FormArray;
  }

  createItem(): FormGroup {
    this.jobCounter +=1;
    return this.fb.group({
      name: [`Job ${this.jobCounter}`, Validators.required],
      duration: [null, Validators.required],
      deadline: [null, Validators.required]
    });
  }

  addItem() {
    this.jobs.push(this.createItem());
  }

  removeItem(index: number) {
    this.jobs.removeAt(index);
  }

  onSubmit() {
    console.log(this.myForm.value);
    this.convertStartTime();
    this.schedule = this.minimizeLateness(this.jobs.value);
    console.log(this.minimizeLateness(this.jobs.value))

    
  }

  convertMinutesToHoursDay(horas: number): string {
    const [sh, sm]= this.myForm.get('startTime')?.value.split(':').map(Number);
    const total = sh * 60 + sm + horas *60;

    const days = Math.floor(total / 1440); // 1440 minutos em um dia
    const minTotal = total % 1440;

    const h = Math.floor(minTotal / 60);
    const m = minTotal % 60;

    const formattedHours = h.toString().padStart(2, '0');
    const formattedMinutes = m.toString().padStart(2, '0');
    return (days > 0 ? `Dia ${days+1} às ` : 'Dia 1 às ') +`${formattedHours}:${formattedMinutes}`;
  }

  convertMinutesToHours(horas: number){

    const h = Math.floor(horas*60 / 60);
    const m = horas*60 % 60;

    const formattedHours = h.toString().padStart(2, '0');
    const formattedMinutes = m.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;

  }

  minimizeLateness(jobs: Job[]){

   
    jobs.sort((a, b) => Number(a.deadline) - (b.deadline));

    let time: number = 0;
    const list: Schedule[] = [];

    this.latenessMax = 0;
    

    jobs.forEach((job)=> {
      const start = time;
      const finish = time + Number(job.duration);
      const lateness = Math.max(0, finish - Number(job.deadline));
      console.log(lateness, finish,job.deadline)
      if(lateness > this.latenessMax){
        console.log("enttou", lateness)
        this.latenessMax = lateness;
      }
      list.push({name: job.name, start: start, finish: finish, lateness: lateness})
      time = finish;
    })

    return list;
  }

  timeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^\d{2}:\d{2}$/.test(value)) {
      return { invalidTime: 'Formato inválido, o formato correto é HH:MM' };
    }
    return null;
  }

  convertStartTime(){
    const [h, m] = this.myForm.get('startTime')?.value.split(':').map(Number);
    this.startTime = h *60 + m;
  }
}
