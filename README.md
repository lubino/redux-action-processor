# datetime-scheduler
ECMAScript 6 (JavaScript) NPM module for executing scheduled tasks

### Installation
``` sh
npm i datetime-scheduler --save
```

**Notice:** This module has zero NPM dependencies, but it uses ES6 language.

### Usage
This example calls *asyncTask* method every saturday and sunday at 12:15 (and 30.500 seconds)
``` javascript
const {createScheduler} = require('datetime-scheduler');

const configuration = {
    "days": {
        "sunday":    true,
        "monday":    false,
        "tuesday":   false,
        "wednesday": false,
        "thursday":  false,
        "friday":    false,
        "saturday":  true
    },
    "time": {
        "hours": 12,
        "minutes":15,
        "seconds": 30,
        "millis": 500
    }
};

const options = {
    asyncTask: async () => {
        console.log("Doing staff");
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log("Finishing staff");
    }
};

createScheduler("weekend at 12:15:30.500", configuration, options);
```

In case you need only one execution on a specific day
``` javascript
const specificDay = "2019-05-18T19:30:00.000Z";
const configuration = {
    "timestamp": new Date(specificDay).getTime()
};
```


Check [weekend.js](https://github.com/lubino/datetime-scheduler/blob/master/example/weekend.js) for a working example.

### License
MIT License