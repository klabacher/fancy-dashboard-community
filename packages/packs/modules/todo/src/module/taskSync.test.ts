import { describe, expect, it, vi } from "vitest";

import type { Task } from "./types";
import {
  TODO_TASK_COMMAND_EVENT,
  TODO_TASKS_CHANGED_EVENT,
  TODO_TASKS_REQUESTED_EVENT,
  broadcastTaskChanges,
  createTaskSaveQueue,
  parseTaskChangeDetail,
  parseTaskCommand,
  requestTaskSnapshot,
  sendTaskCommand,
  subscribeToTaskChanges,
  subscribeToTaskCommands,
  subscribeToTaskRequests,
} from "./taskSync";

const task = (id: string): Task => ({
  id,
  title: `Task ${id}`,
  priority: "medium",
  completed: false,
  createdAt: "2026-09-14T12:00:00.000Z",
  updatedAt: "2026-09-14T12:00:00.000Z",
});

describe("task synchronization", () => {
  it("accepts valid task arrays and returns defensive copies", () => {
    const source = [task("one")];
    const parsed = parseTaskChangeDetail(source);
    expect(parsed).toEqual(source);
    expect(parsed).not.toBe(source);
    expect(parsed?.[0]).not.toBe(source[0]);
  });

  it("rejects malformed event payloads and commands", () => {
    expect(parseTaskChangeDetail({})).toBeNull();
    expect(parseTaskChangeDetail([{ id: "missing-fields" }])).toBeNull();
    expect(
      parseTaskChangeDetail([{ ...task("bad"), priority: "urgent" }]),
    ).toBeNull();

    expect(
      parseTaskCommand({ type: "toggle-complete", taskId: "one" }),
    ).toEqual({ type: "toggle-complete", taskId: "one" });
    expect(
      parseTaskCommand({
        type: "update-due-date",
        taskId: "one",
        dueDate: "2026-09-15",
      }),
    ).toEqual({
      type: "update-due-date",
      taskId: "one",
      dueDate: "2026-09-15",
    });
    expect(parseTaskCommand({ type: "delete", taskId: "one" })).toBeNull();
    expect(
      parseTaskCommand({ type: "update-due-date", taskId: "one" }),
    ).toBeNull();
  });

  it("broadcasts valid snapshots and ignores malformed events", () => {
    const target = new EventTarget();
    const listener = vi.fn();
    const unsubscribe = subscribeToTaskChanges(listener, target);

    const source = [task("one")];
    broadcastTaskChanges(source, target);
    source[0].title = "mutated after dispatch";
    expect(listener).toHaveBeenCalledWith([
      expect.objectContaining({ title: "Task one" }),
    ]);

    target.dispatchEvent(
      new CustomEvent(TODO_TASKS_CHANGED_EVENT, { detail: [{ id: "bad" }] }),
    );
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    broadcastTaskChanges([task("two")], target);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("routes snapshot requests and validated commands", () => {
    const target = new EventTarget();
    const onRequest = vi.fn();
    const onCommand = vi.fn();
    const unsubscribeRequest = subscribeToTaskRequests(onRequest, target);
    const unsubscribeCommand = subscribeToTaskCommands(onCommand, target);

    requestTaskSnapshot(target);
    sendTaskCommand({ type: "toggle-complete", taskId: "one" }, target);
    target.dispatchEvent(
      new CustomEvent(TODO_TASK_COMMAND_EVENT, {
        detail: { type: "delete", taskId: "one" },
      }),
    );

    expect(onRequest).toHaveBeenCalledOnce();
    expect(onCommand).toHaveBeenCalledOnce();
    expect(onCommand).toHaveBeenCalledWith({
      type: "toggle-complete",
      taskId: "one",
    });

    unsubscribeRequest();
    unsubscribeCommand();
    target.dispatchEvent(new Event(TODO_TASKS_REQUESTED_EVENT));
    sendTaskCommand({ type: "toggle-complete", taskId: "two" }, target);
    expect(onRequest).toHaveBeenCalledOnce();
    expect(onCommand).toHaveBeenCalledOnce();
  });

  it("copies command payloads before dispatch", () => {
    const target = new EventTarget();
    const commands: unknown[] = [];
    target.addEventListener(TODO_TASK_COMMAND_EVENT, (event) => {
      commands.push((event as CustomEvent<unknown>).detail);
    });
    const command = {
      type: "update-due-date" as const,
      taskId: "one",
      dueDate: "2026-09-15",
    };
    sendTaskCommand(command, target);
    command.dueDate = "mutated";
    expect(commands).toEqual([
      {
        type: "update-due-date",
        taskId: "one",
        dueDate: "2026-09-15",
      },
    ]);
  });

  it("serializes persistence and snapshots each mutation", async () => {
    let releaseFirst: (() => void) | undefined;
    const calls: string[] = [];
    const queue = createTaskSaveQueue(async (tasks) => {
      calls.push(`start:${tasks[0].id}`);
      if (tasks[0].id === "one") {
        await new Promise<void>((resolve) => {
          releaseFirst = resolve;
        });
      }
      calls.push(`end:${tasks[0].id}`);
    });

    const first = [task("one")];
    const pendingFirst = queue.enqueue(first);
    first[0].id = "mutated";
    const pendingSecond = queue.enqueue([task("two")]);
    await vi.waitFor(() => expect(calls).toEqual(["start:one"]));
    releaseFirst?.();
    await Promise.all([pendingFirst, pendingSecond, queue.drain()]);

    expect(calls).toEqual(["start:one", "end:one", "start:two", "end:two"]);
  });
});
