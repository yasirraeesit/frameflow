import { TimelineDocument } from '../timeline/types.js';
import { ICommand } from './command.interface.js';

export class CommandHistory {
  private past: ICommand[] = [];
  private future: ICommand[] = [];

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  get undoStackLength(): number {
    return this.past.length;
  }

  get redoStackLength(): number {
    return this.future.length;
  }

  execute(command: ICommand, timeline: TimelineDocument): TimelineDocument {
    const nextTimeline = command.execute(timeline);
    this.past.push(command);
    this.future = []; // Clear redo stack on new action
    return nextTimeline;
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    const command = this.past.pop();
    if (!command) return timeline;

    const previousTimeline = command.undo(timeline);
    this.future.push(command);
    return previousTimeline;
  }

  redo(timeline: TimelineDocument): TimelineDocument {
    const command = this.future.pop();
    if (!command) return timeline;

    const nextTimeline = command.execute(timeline);
    this.past.push(command);
    return nextTimeline;
  }

  clear() {
    this.past = [];
    this.future = [];
  }
}

