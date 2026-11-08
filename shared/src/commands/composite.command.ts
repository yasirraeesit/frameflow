import { TimelineDocument } from '../timeline/types.js';
import { ICommand } from './command.interface.js';

export class CompositeCommand implements ICommand {
  id: string;

  constructor(
    public name: string,
    public commands: ICommand[]
  ) {
    this.id = `composite-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    let current = timeline;
    for (const cmd of this.commands) {
      current = cmd.execute(current);
    }
    return current;
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    let current = timeline;
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      const cmd = this.commands[i];
      if (cmd) {
        current = cmd.undo(current);
      }
    }
    return current;
  }
}

