/// <reference path="../../../typings/tsd.d.ts" />

import {Inject,
        CSSClass,
        NgFor,
        Component,
        View,
        ElementRef} from 'angular2/angular2';
import {ToDoService, ToDoItem, ToDoFactory, FilterByTypes} from '../services/ToDoService';
import {Autofocus} from '../directives/Autofocus';

@Component({
  selector: 'todo',
  viewInjector: [ToDoService, ToDoFactory]
})
@View({
  templateUrl: '../templates/html/todo.html',
  directives: [CSSClass, NgFor, Autofocus]
})
export class ToDo {
  filterBy: FilterByTypes = FilterByTypes.all;

  todoEdit: ToDoItem = null;

  private _elem: ElementRef;
  private _toDoFactory: ToDoFactory;
  public toDoService: ToDoService;

  constructor(@Inject(ElementRef) elem: ElementRef,
              @Inject(ToDoService) toDoService: ToDoService,
              @Inject(ToDoFactory) toDoFactory: ToDoFactory) {
    this._elem = elem;
    this.toDoService = toDoService;
    this._toDoFactory = toDoFactory;
  }

  getToDos() {
    return this.toDoService.list;
  }

  enterTodo(inputElement): void {
    this.addTodo(inputElement.value);
    inputElement.value = '';
  }

  editTodo(todo: ToDoItem): void {
    this.todoEdit = todo;
  }

  doneEditing($event, todo: ToDoItem): void {
    var which = $event.which;
    var target = $event.target;
    if (which === 13) {
      todo.title = target.value;
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      target.value = todo.title;
    }
  }

  addTodo(newTitle: string): void {
    this.toDoService.add(this._toDoFactory.create(newTitle, false));
  }

  completeMe(todo: ToDoItem): void {
    todo.completed = !todo.completed;
  }

  deleteMe(todo: ToDoItem): void {
    this.toDoService.remove(todo);
  }

  toggleAll($event): void {
    var isComplete = $event.target.checked;
    this.toDoService
        .list
        .forEach((todo: ToDoItem) => {
                   todo.completed = isComplete;
                 });
  }

  clearCompleted(): void {
    event.preventDefault();
    this.toDoService
        .removeBy((todo) => todo.completed);
  }

  applyFilter(event, filterBy: string): void {
    event.preventDefault();

    this.filterBy = FilterByTypes[filterBy];

    if (typeof this.filterBy === 'undefined')
      this.filterBy = FilterByTypes.all;

    this.toDoService.filter(this.filterBy);
  }
}
