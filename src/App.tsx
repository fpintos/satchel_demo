import React from 'react';
import { createStore, action, mutator } from 'satcheljs';
import { observer } from 'mobx-react-lite';
import { TextField, PrimaryButton } from 'office-ui-fabric-react';
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths';
import './App.css';
import knowledge from './knowledge.json';

// Styles
const style: React.CSSProperties = { margin: 20 };
const boxStyle: React.CSSProperties = {
    boxShadow: Depths.depth8,
    padding: 20,
    width: 400,
    marginBottom: 5,
};

// UI elements
export default observer(function QuestionOrAnswerNode() {
    const answerNode = isAnswerNode();
    return (
        <div style={style}>
            <div style={{ marginBottom: 20 }}>
                <PrimaryButton iconProps={{ iconName: 'Save' }} onClick={saveGame}>
                    Save
                </PrimaryButton>
                &nbsp;
                <PrimaryButton iconProps={{ iconName: 'OpenFolderHorizontal' }} onClick={loadGame}>
                    Load
                </PrimaryButton>
                &nbsp;
                <PrimaryButton iconProps={{ iconName: 'Refresh' }} onClick={resetGame}>
                    Reset
                </PrimaryButton>
            </div>
            {answerNode && (
                <div>
                    {!getGuessIsWrong() && (
                        <div>
                            <p>I think it is {getCurrentText()}.</p>
                            <p>Did I guess correctly?</p>
                            <PrimaryButton
                                iconProps={{ iconName: 'CheckMark' }}
                                onClick={guessIsCorrect}>
                                Yes
                            </PrimaryButton>
                            &nbsp;
                            <PrimaryButton
                                iconProps={{ iconName: 'Cancel' }}
                                onClick={guessIsWrong}>
                                No
                            </PrimaryButton>
                        </div>
                    )}
                    {getGuessIsWrong() && (
                        <div>
                            <form onSubmit={onFormSubmit} style={boxStyle}>
                                <TextField
                                    label={getInputLabel()}
                                    value={getInputText()}
                                    onChange={onInputTextChange}
                                />
                                <PrimaryButton iconProps={{ iconName: 'CheckMark' }} type="submit">
                                    OK
                                </PrimaryButton>
                            </form>
                        </div>
                    )}
                </div>
            )}
            {!answerNode && (
                <div>
                    {getCurrentText()}
                    <br />
                    <PrimaryButton iconProps={{ iconName: 'CheckMark' }} onClick={moveLeft}>
                        Yes
                    </PrimaryButton>
                    &nbsp;
                    <PrimaryButton iconProps={{ iconName: 'Cancel' }} onClick={moveRight}>
                        No
                    </PrimaryButton>
                </div>
            )}
        </div>
    );
});

// UI event handlers
function onFormSubmit(e: React.FormEvent) {
    onNewAnswer();
    e.preventDefault();
}

function onInputTextChange(
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string | undefined
) {
    setInputText(newValue || '');
}

// State and Business logic of the UI
const getStore = createStore('questions', {
    index: 0,
    guessIsWrong: false,
    askingForName: false,
    newName: '',
    newQuestion: '',
    strings: knowledge as string[],
});

// Selectors
function getNextLeftIndex() {
    return 2 * getStore().index + 1;
}

function getNextRightIndex() {
    return 2 * getStore().index + 2;
}

function getCurrentText() {
    const { index, strings } = getStore();
    return strings[index];
}

function getGuessIsWrong() {
    return getStore().guessIsWrong;
}

function isAnswerNode() {
    const { strings } = getStore();
    return !strings[getNextLeftIndex()] && !strings[getNextRightIndex()];
}

function getInputLabel() {
    return getStore().askingForName
        ? 'Well done, you beat me. What was your object?'
        : `Type a question that is true for ${
              getStore().newName
          }, but not for ${getCurrentText()}.`;
}

function getInputText() {
    return getStore().askingForName ? getStore().newName : getStore().newQuestion;
}

// Actions
const moveLeft = action('moveLeft');
const moveRight = action('moveRight');
const guessIsCorrect = action('guessIsCorrect');
const guessIsWrong = action('guessIsWrong');

const setInputText = action('setInputText', (text: string) => ({ text }));
const onNewAnswer = action('onNewAnswer');

const saveGame = action('saveGame');
const loadGame = action('loadGame');
const resetGame = action('resetGame');

// Mutators (ie, action handlers)
mutator(moveLeft, () => {
    getStore().index = getNextLeftIndex();
});

mutator(moveRight, () => {
    getStore().index = getNextRightIndex();
});

mutator(guessIsCorrect, () => {
    startOver();
});

mutator(guessIsWrong, () => {
    getStore().guessIsWrong = true;
    getStore().askingForName = true;
    getStore().newName = '';
    getStore().newQuestion = '';
});

mutator(setInputText, ({ text }) => {
    if (getStore().askingForName) {
        getStore().newName = text;
    } else {
        getStore().newQuestion = text;
    }
});

mutator(onNewAnswer, () => {
    if (getStore().askingForName) {
        getStore().askingForName = false;
    } else {
        const { strings, index, newQuestion, newName } = getStore();

        const rightIndex = getNextRightIndex();
        while (strings.length < rightIndex) {
            strings.push('');
        }

        strings[rightIndex] = strings[index];
        strings[index] = newQuestion;
        strings[rightIndex - 1] = newName;

        startOver();
    }
});

mutator(saveGame, () => {
    localStorage['strings'] = JSON.stringify(getStore().strings);
});

mutator(loadGame, () => {
    startOver();
    getStore().strings = JSON.parse(localStorage['strings']);
});

mutator(resetGame, () => {
    startOver();
    getStore().strings = knowledge;
});

function startOver() {
    getStore().index = 0;
    getStore().guessIsWrong = false;
}
