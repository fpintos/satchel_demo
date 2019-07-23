import React, { useCallback } from 'react';
import { createStore, action, mutator, orchestrator } from 'satcheljs';
import { applyMiddleware, DispatchFunction, ActionMessage } from 'satcheljs';
import { observer } from 'mobx-react-lite';
import { TextField, PrimaryButton, ActionButton } from 'office-ui-fabric-react';
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths';
import './App.css';

// Styles
const style: React.CSSProperties = { margin: 20 };
const boxStyle: React.CSSProperties = {
    boxShadow: Depths.depth8,
    padding: 20,
    width: 400,
    marginBottom: 5,
};

// UI elements
export default observer(function ToDo() {
    return (
        <div style={style}>
            <form onSubmit={onFormSubmit} style={boxStyle}>
                <TextField
                    label="Enter a new TODO:"
                    value={getInputText()}
                    onChange={onInputTextChange}
                />
                <PrimaryButton iconProps={{ iconName: 'Add' }} type="submit">
                    Add
                </PrimaryButton>
            </form>
            {getToDos().map((todo, i) => (
                <ToDoElement key={i} index={i} todo={todo} />
            ))}
        </div>
    );
});

const ToDoElement = observer(function ToDoElement({ index, todo }: { index: number; todo: ToDo }) {
    const deleteCallback = useCallback(() => deleteTodo(index), [index]);
    return (
        <div style={boxStyle}>
            <TextField
                label={new Date(todo.whenCreated).toISOString()}
                value={todo.text}
                disabled={true}
            />
            <ActionButton iconProps={{ iconName: 'Delete' }} onClick={deleteCallback}>
                DELETE
            </ActionButton>
        </div>
    );
});

// UI event handlers
function onFormSubmit(e: React.FormEvent) {
    addTodo();
    e.preventDefault();
}

function onInputTextChange(
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string | undefined
) {
    setInputText(newValue || '');
}

// State and Business logic of the UI
export interface ToDo {
    text: string;
    whenCreated: number;
}

const getStore = createStore('todoStore', {
    inputText: 'Hello',
    todos: [{ text: 'Initial', whenCreated: Date.now() }] as ToDo[],
});

// Selectors
function getInputText() {
    return getStore().inputText;
}

function getToDos() {
    return getStore().todos;
}

// Actions
const setInputText = action('setInputText', (text: string) => ({ text }));
const addTodo = action('addTodo');
const deleteTodo = action('deleteTodo', (index: number) => ({ index }));

// Mutators (ie, action handlers)
mutator(setInputText, ({ text }) => {
    getStore().inputText = text;
});

mutator(addTodo, () => {
    getStore().todos.push({ text: getInputText(), whenCreated: Date.now() });
});

mutator(deleteTodo, ({ index }) => {
    getStore().todos.splice(index, 1);
});

// Other parts of the application can also respond to these actions
orchestrator(addTodo, () => {
    console.log('Example, invoke a web service to save the new todo');
});

// The application can intercept actions, for logging/telemetry/error handling,etc.
function logActions(next: DispatchFunction, message: ActionMessage) {
    console.time(message.type);
    next(message);
    console.timeEnd(message.type);
}
applyMiddleware(logActions);
