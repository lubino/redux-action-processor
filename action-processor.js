export function createContext() {
    let store;
    const actionListeners = {};
    return {
        getStore: () => store,
        setStore: newStore => store = newStore,
        getActionListener: actionType => actionListeners[actionType],
        setActionListener: (actionType, listener) => {
            actionListeners[actionType] = listener
        },
    }
}

let globalContext;
const defaultContext = () => {
    if (!globalContext) globalContext = createContext();
    return globalContext;
};

export const createMiddleware = (context = defaultContext()) => store => {
    context.setStore(store);
    return next => action => {
        const actionListener = action && context.getActionListener(action.type);
        if (actionListener) {
            actionListener(action);
        }
        next(action);
    };
};

function createCollector(context = defaultContext()) {

    const resolveActionCreators = [];
    const rejectActionCreators = [];
    const thenListeners = [];
    const catchListeners = [];

    const store = context.getStore();

    const collector = {};
    collector.thenDispatchResult = actionCreator => {
        if (actionCreator) resolveActionCreators.push(actionCreator);
        return collector;
    };
    collector.thenDispatchError = actionCreator => {
        if (actionCreator) rejectActionCreators.push(actionCreator);
        return collector;
    };
    collector.then = t => {
        thenListeners.push(t);
        return collector;
    };
    collector.catch = c => {
        catchListeners.push(c);
        return collector;
    };

    return {
        handleAction: async (action, method) => {
            if (!method) return;
            const promise = method(action);
            if (!promise) return;
            thenListeners.map(thenListener => promise.then(thenListener));
            catchListeners.map(catchListener => promise.catch(catchListener));
            try {
                let result = await promise;
                resolveActionCreators.map(actionCreator => {
                    const resolveAction = actionCreator(result, action);
                    if (resolveAction) {
                        context.onResolve && context.onResolve(resolveAction);
                        store.dispatch(resolveAction);
                    }
                });
            } catch (e) {
                rejectActionCreators.map(actionCreator => {
                    const rejectAction = actionCreator(e, action);
                    if (rejectAction) {
                        context.onReject && context.onReject(rejectAction);
                        store.dispatch(rejectAction)
                    }
                })
            }
        }, collector
    }
}

export function registerCallAction(actionType, context, method) {
    if (!method && typeof context === 'function') {
        method = context;
        context = defaultContext();
    }

    const {handleAction, collector} = createCollector(context);
    const actionTypes = actionType && Array.isArray(actionType) ? actionType : [actionType];
    actionTypes.map(actionType => {
        const previousListener = context.getActionListener(actionType);
        context.setActionListener(actionType, async action => {
            await handleAction(action, method);
            previousListener && previousListener(action);
        });
    });
    return collector;
}
