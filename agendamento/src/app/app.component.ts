import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Job, JobSchedule, Schedule, ScheduleLateness } from './models/job.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'agendamento';

  scheduleLatenessForm!: FormGroup;
  latenessMax: number = 0;
  startTime!: number;
  scheduleLateness: ScheduleLateness[] = [];


  scheduleMaxForm!: FormGroup;
  schedule: Schedule[] = [];


  jobCounterLateness: number = 0;
  jobCounterMax: number = 0;

  type!: number;

  
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.scheduleLatenessForm = this.fb.group({
      jobs: this.fb.array([this.createItemLateness()]),
      startTime: [null, [Validators.required, this.timeValidator]]
    });

    this.scheduleMaxForm = this.fb.group({
      jobs: this.fb.array([this.createItemMax()]),
    });
  }

  choiceSchedule(id: number){
    if(id == 0)
      this.type = 0;
    else this.type = 1;
  }

  get jobsLateness(): FormArray {
    return this.scheduleLatenessForm.get('jobs') as FormArray;
  }
  get jobsMax(): FormArray {
    return this.scheduleMaxForm.get('jobs') as FormArray;
  }


  createItemLateness(): FormGroup {
    this.jobCounterLateness +=1;
    return this.fb.group({
      name: [`Tarefa ${this.jobCounterLateness}`, Validators.required],
      duration: [null, Validators.required],
      deadline: [null, Validators.required]
    });
  }

  createItemMax(): FormGroup {
    this.jobCounterMax +=1;
    return this.fb.group({
      name: [`Tarefa ${this.jobCounterMax}`, Validators.required],
      start: [null, [Validators.required, this.timeValidator]],
      finish: [null, [Validators.required, this.timeValidator]]
    });
  }

  addItem() {
    if(this.type == 1)
      this.jobsLateness.push(this.createItemLateness());
    else this.jobsMax.push(this.createItemMax());
  }

  removeItem(index: number) {
    if(this.type == 1 ){
      this.jobsLateness.removeAt(index);
    }
    else this.jobsMax.removeAt(index)
  }


  timeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^\d{2}:\d{2}$/.test(value)) {
      return { invalidTime: 'Formato inválido, o formato correto é HH:MM' };
    }
    return null;
  }

 


  ///////////////////////////////// Max Schedule///////////////////////////////////////


  resultMax(){
    console.log(this.scheduleMaxForm.value);
    this.schedule = this.scheduleIntervals(this.jobsMax.value);

  }

  convertHour(value: string): number {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }
  
  scheduleIntervals(jobs: JobSchedule[]): Schedule[] {
    jobs.sort((a, b) => this.convertHour(a.finish) - this.convertHour(b.finish));
  
    const list: Schedule[] = [];
    let lastFinishTime = 0;
  
    for (const job of jobs) {
      const jobStart = this.convertHour(job.start);
      const jobFinish = this.convertHour(job.finish);
  
      if (jobStart >= lastFinishTime) {
        list.push({
          start: job.start,
          finish: job.finish,
          name: job.name
        });
        lastFinishTime = jobFinish;
      }
    }
  
    return list;
  }

  exportToCSVSchedule(): void {
    const csvData = this.schedule.map((item, index) => ({
      '#': index + 1,
      'Nome da Tarefa': item.name,
      'Horário Início': item.start,
      'Horário de Fim': item.finish,
    }));

    const header = ['#', 'Nome da Tarefa', 'Horário Início', 'Horário de Fim'];
    const rows = csvData.map(item => Object.values(item).join(','));

    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tarefa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }



  ////////////////////////////// Lateness ////////////////////////////////////////////

  convertHourToHHMM(horas: number){

    const h = Math.floor(horas*60 / 60);
    const m = horas*60 % 60;

    const formattedHours = h.toString().padStart(2, '0');
    const formattedMinutes = m.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;

  }


  convertDay(horas: number): string {

    let total = 0;
    if(this.type == 1){
      const [sh, sm]= this.scheduleLatenessForm.get('startTime')?.value.split(':').map(Number);
      total = sh * 60 + sm + horas *60;
    }else{
      total =  horas *60;
    }


    const days = Math.floor(total / 1440);
    const minTotal = total % 1440;

    const h = Math.floor(minTotal / 60);
    const m = minTotal % 60;

    const formattedHours = h.toString().padStart(2, '0');
    const formattedMinutes = m.toString().padStart(2, '0');
    return (days > 0 ? `Dia ${days+1} às ` : 'Dia 1 às ') +`${formattedHours}:${formattedMinutes}`;
  }

  convertStartTime(){
    const [h, m] = this.scheduleLatenessForm.get('startTime')?.value.split(':').map(Number);
    this.startTime = h *60 + m;
  }

  resultLateness() {
    console.log(this.scheduleLatenessForm.value);
    this.convertStartTime();
    this.scheduleLateness = this.minimizeLateness(this.jobsLateness.value);
    console.log(this.minimizeLateness(this.jobsLateness.value))
  }


  minimizeLateness(jobs: Job[]){

   
    jobs.sort((a, b) => Number(a.deadline) - (b.deadline));

    let time: number = 0;
    const list: ScheduleLateness[] = [];

    this.latenessMax = 0;
    

    jobs.forEach((job)=> {
      const start = time;
      const finish = time + Number(job.duration);
      const lateness = Math.max(0, finish - Number(job.deadline));
      if(lateness > this.latenessMax){
        this.latenessMax = lateness;
      }
      list.push({name: job.name, start: start, finish: finish, lateness: lateness})
      time = finish;
    })

    return list;
  }

  exportToCSVLateness(): void {
    const csvData = this.scheduleLateness.map((item, index) => ({
      'Nº': index + 1,
      'Nome da Tarefa': item.name,
      'Horário Início': this.convertDay(item.start),
      'Horário de Fim': this.convertDay(item.finish),
      'Atraso': this.convertHourToHHMM(item.lateness),

    }));

    const header = ['Nº', 'Nome da Tarefa', 'Horário Início', 'Horário de Fim', 'Atraso'];
    const rows = csvData.map(item => Object.values(item).join(','));

    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tarefa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}