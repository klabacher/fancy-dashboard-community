import { describe, expect, it, vi } from "vitest";

import {
  TODO_TASK_COMMAND_EVENT,
  TODO_TASKS_REQUESTED_EVENT,
  parseTaskChangeDetail,
  requestTaskSnapshot,
  sendTaskCommand,
  subscribeToTaskChanges,
  type Task,
} from "./taskBridge";
import {
  broadcastTaskChanges as broadcastTodoTaskChanges,
  subscribeToTaskCommands as subscribeToTodoTaskCommands,
  subscribeToTaskRequests as subscribeToTodoTaskRequests,
} from "../../../todo/src/module/taskSync";

const task = (id: string): Task => ({
  id,
  title: `Task ${id}`,
  priority: "medium",
  completed: false,
  createdAt: "2026-09-14T12:00:00.000Z",
  updatedAt: "2026-09-14T12:00:00.000Z",
});

describe("Calendar task bridge", () => {
  it("validates task snapshots and returns defensive copies", () => {
    const source = [task("one")];
    const parsed = parseTaskChangeDetail(source);
    expect(parsed).toEqual(source);
    expect(parsed).not.toBe(source);
    expect(parsed?.[0]).not.toBe(source[0]);
    expect(parseTaskChangeDetail([{ id: "invalid" }])).toBeNull();
  });

  it("requests snapshots and sends narrow task commands", () => {
    const target = new EventTarget();
    const onRequest = vi.fn();
    const commands: unknown[] = [];
    target.addEventListener(TODO_TASKS_REQUESTED_EVENT, onRequest);
    target.addEventListener(TODO_TASK_COMMAND_EVENT, (event) => {
      commands.push((event as CustomEvent<unknown>).detail);
    });

    requestTaskSnapshot(target);
    sendTaskCommand({ type: "toggle-complete", taskId: "one" }, target);
    sendTaskCommand(
      { type: "update-due-date", taskId: "one", dueDate: "2026-09-15" },
      target,
    );

    expect(onRequest).toHaveBeenCalledOnce();
    expect(commands).toEqual([
      { type: "toggle-complete", taskId: "one" },
      {
        type: "update-due-date",
        taskId: "one",
        dueDate: "2026-09-15",
      },
    ]);
  });

  it("subscribes only to valid task snapshots and can unsubscribe", () => {
    const target = new EventTarget();
    const listener = vi.fn();
    const unsubscribe = subscribeToTaskChanges(listener, target);

    target.dispatchEvent(
      new CustomEvent("fancydashboard:todo-tasks-changed", {
        detail: [task("one")],
      }),
    );
    target.dispatchEvent(
      new CustomEvent("fancydashboard:todo-tasks-changed", {
        detail: [{ id: "invalid" }],
      }),
    );
    unsubscribe();
    target.dispatchEvent(
      new CustomEvent("fancydashboard:todo-tasks-changed", {
        detail: [task("two")],
      }),
    );

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith([task("one")]);
  });

  it("interoperates with the independently bundled To-Do protocol", () => {
    const target = new EventTarget();
    const tasks = [task("shared")];
    const onTasks = vi.fn();
    const onCommand = vi.fn();

    const stopRequests = subscribeToTodoTaskRequests(
      () => broadcastTodoTaskChanges(tasks, target),
      target,
    );
    const stopCommands = subscribeToTodoTaskCommands(onCommand, target);
    const stopChanges = subscribeToTaskChanges(onTasks, target);

    requestTaskSnapshot(target);
    sendTaskCommand({ type: "toggle-complete", taskId: "shared" }, target);

    expect(onTasks).toHaveBeenCalledWith(tasks);
    expect(onCommand).toHaveBeenCalledWith({
      type: "toggle-complete",
      taskId: "shared",
    });

    stopRequests();
    stopCommands();
    stopChanges();
  });
});
