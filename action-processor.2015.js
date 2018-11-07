'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createContext = createContext;
exports.registerCallAction = registerCallAction;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createContext() {
    var store = void 0;
    var actionListeners = {};
    return {
        getStore: function getStore() {
            return store;
        },
        setStore: function setStore(newStore) {
            return store = newStore;
        },
        getActionListener: function getActionListener(actionType) {
            return actionListeners[actionType];
        },
        setActionListener: function setActionListener(actionType, listener) {
            actionListeners[actionType] = listener;
        }
    };
}

var globalContext = void 0;
var defaultContext = function defaultContext() {
    if (!globalContext) globalContext = createContext();
    return globalContext;
};

var createMiddleware = exports.createMiddleware = function createMiddleware() {
    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultContext();
    return function (store) {
        context.setStore(store);
        return function (next) {
            return function (action) {
                var actionListener = action && context.getActionListener(action.type);
                if (actionListener) {
                    actionListener(action);
                }
                next(action);
            };
        };
    };
};

function createCollector() {
    var _this = this;

    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultContext();


    var resolveActionCreators = [];
    var rejectActionCreators = [];
    var thenListeners = [];
    var catchListeners = [];

    var store = context.getStore();

    var collector = {};
    collector.thenDispatchResult = function (actionCreator) {
        if (actionCreator) resolveActionCreators.push(actionCreator);
        return collector;
    };
    collector.thenDispatchError = function (actionCreator) {
        if (actionCreator) rejectActionCreators.push(actionCreator);
        return collector;
    };
    collector.then = function (t) {
        thenListeners.push(t);
        return collector;
    };
    collector.catch = function (c) {
        catchListeners.push(c);
        return collector;
    };

    return {
        handleAction: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(action, method) {
                var promise, result;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (method) {
                                    _context.next = 2;
                                    break;
                                }

                                return _context.abrupt('return');

                            case 2:
                                promise = method(action);

                                if (promise) {
                                    _context.next = 5;
                                    break;
                                }

                                return _context.abrupt('return');

                            case 5:
                                thenListeners.map(function (thenListener) {
                                    return promise.then(thenListener);
                                });
                                catchListeners.map(function (catchListener) {
                                    return promise.catch(catchListener);
                                });
                                _context.prev = 7;
                                _context.next = 10;
                                return promise;

                            case 10:
                                result = _context.sent;

                                resolveActionCreators.map(function (actionCreator) {
                                    var resolveAction = actionCreator(result, action);
                                    if (resolveAction) {
                                        context.onResolve && context.onResolve(resolveAction);
                                        store.dispatch(resolveAction);
                                    }
                                });
                                _context.next = 17;
                                break;

                            case 14:
                                _context.prev = 14;
                                _context.t0 = _context['catch'](7);

                                rejectActionCreators.map(function (actionCreator) {
                                    var rejectAction = actionCreator(_context.t0, action);
                                    if (rejectAction) {
                                        context.onReject && context.onReject(rejectAction);
                                        store.dispatch(rejectAction);
                                    }
                                });

                            case 17:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, _this, [[7, 14]]);
            }));

            return function handleAction(_x3, _x4) {
                return _ref.apply(this, arguments);
            };
        }(), collector: collector
    };
}

function registerCallAction(actionType, context, method) {
    var _this2 = this;

    if (!method && typeof context === 'function') {
        method = context;
        context = defaultContext();
    }

    var _createCollector = createCollector(context),
        handleAction = _createCollector.handleAction,
        collector = _createCollector.collector;

    var actionTypes = actionType && Array.isArray(actionType) ? actionType : [actionType];
    actionTypes.map(function (actionType) {
        var previousListener = context.getActionListener(actionType);
        context.setActionListener(actionType, function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(action) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return handleAction(action, method);

                            case 2:
                                previousListener && previousListener(action);

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, _this2);
            }));

            return function (_x5) {
                return _ref2.apply(this, arguments);
            };
        }());
    });
    return collector;
}