import React, { useCallback } from 'react';
import { createStore, action, mutator, orchestrator } from 'satcheljs';
import { applyMiddleware, DispatchFunction, ActionMessage } from 'satcheljs';
import { observer } from 'mobx-react-lite';
import './App.css';

// Styles
const style = { margin: 20 };

// UI elements
export default observer(function ToDo() {
    return (
        <div style={style}>
            <form onSubmit={onFormSubmit}>
                Enter a new TODO:
                <br />
                <input type="text" value={getInputText()} onChange={onInputTextChange} />
                <button type="submit">ADD</button>
            </form>
            <ul>
                {getToDos().map((todo, i) => (
                    <ToDoElement key={i} index={i} todo={todo} />
                ))}
            </ul>
        </div>
    );
});

const ToDoElement = observer(function ToDoElement({ index, todo }: { index: number; todo: ToDo }) {
    const deleteCallback = useCallback(() => deleteTodo(index), [index]);
    return (
        <li>
            <span>{new Date(todo.whenCreated).toISOString()}</span>
            <span style={{ margin: '0px 20px' }}>{todo.text}</span>
            <button onClick={deleteCallback}>DELETE</button>
        </li>
    );
});

// UI event handlers
function onFormSubmit(e: React.FormEvent) {
    addTodo();
    e.preventDefault();
}

function onInputTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
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
