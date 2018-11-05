# redux-action-processor
Redux Middleware for cleaner application logic structure

### Installation
``` sh
npm install --save redux-action-processor
```

**Notice:** This module has zero NPM dependencies, but it uses ES6 language.

### Self explaining example
Simple way to listen and react to dispatched actions.

Redux store:
``` javascript
import {createStore, compose, applyMiddleware} from 'redux'
import {createContext, createMiddleware} from 'redux-action-processor'
import {rootReducer, STATE} from './rootReducer' // my root reducer

// you can have pleanty of contexts, or only one as global parameter
export const context = createContext();
const myMiddleware = createMiddleware(context);

export const store = createStore(
    rootReducer,
    STATE,
    applyMiddleware(myMiddleware)
);
```

Listen and react to dispatched actions anywhere:
``` javascript
import {registerCallAction} from 'redux-action-processor'

registerCallAction('ACTION_TYPE', context, async (action) => {
    console.log("Woow, action.type === 'ACTION_TYPE' has been dispatched");
    const result = await doSomethingToGetSomeResult();
    if (!result) throw new Error('Ouch, result is not here');
    return result; 
})
//optional Promise like 'then' methods
.then( result => {
    console.log('something optional to do');
    return result;
})
.then( result => {
    console.log('something else to do');
    return result;
})
// calling optional 'thenDispatchResult' or 'thenDispatchError' means
// that after async function finishes execution, the result (or exception) is  
// dispatched using given action creator
.thenDispatchResult( (result, action) => anotherActionCreator(result, action) )
.thenDispatchError( (error, action) => anotherExceptionalActionCreator(error, action) )

function anotherActionCreator(data, action) {
    return {
        type:'ACTION_TYPE_SUCCESS',
        someAttributesOfNewActionToDispatch: {data, action}
    }
}

function anotherExceptionalActionCreator(error, action) {
    return {
        type:'ACTION_TYPE_FAILED',
        someAttributesOfNewActionToDispatch: {error, action}
    }
}

```

### License
MIT License